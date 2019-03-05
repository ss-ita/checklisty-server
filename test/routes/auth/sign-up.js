/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Authorisation Sign Up', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findOne')
      .onFirstCall().returns({})
      .onSecondCall().returns(null)
      .onThirdCall().returns(null);
    sinon.stub(mongoose.Model.prototype, 'save');
  });

  after(() => {
    mongoose.Model.findOne.restore();
    mongoose.Model.prototype.save.restore();
  });

  describe('Sign up', async () => {
    it('Shold throw error not valid user data', () => {
      chai.request(server)
        .post('/api/auth/signup')
        .send({ username: 'JonhDoe', email: 'notValidEmail', password: '123456' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.eql('"email" must be a valid email');
        });
    });

    it('Should reject creating  user with username already exsist', () => {
      chai.request(server)
        .post('/api/auth/signup')
        .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('username');
          res.body.username.should.eql('User with this username is already exist.');
        });
    });

    it('Should create user', () => {
      chai.request(server)
        .post('/api/auth/signup')
        .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
        .end((err, res) => {
          res.should.have.status(200);
          res.header.should.have.property('access-token');
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.user.should.have.property('username').eql('JonhDoe');
        });
    });
  });
});
