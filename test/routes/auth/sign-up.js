/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const User = require('../../../api/models/user-model');
const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Authorisation Sign Up', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findOne')
      .onCall(0).throws({ message: 'Some error' })
      .onCall(1).returns({})
      .onCall(2).returns(null)
      .onCall(3).returns({})
      .onCall().returns(null)
    sinon.stub(mongoose.Model.prototype, 'save');
    sinon.stub(User, 'validate');
  });

  after(() => {
    mongoose.Model.findOne.restore();
    mongoose.Model.prototype.save.restore();
  });

  it('Shold reject when username or email is absent', () => {
    chai.request(server)
      .post('/api/auth/signup')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });

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

  it('Should reject with some error', () => {
    chai.request(server)
      .post('/api/auth/signup')
      .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Some error');
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
        res.body.username.should.eql('User with this username is already exist!');
      });
  });

  it('Should reject creating  user with email already exsist', () => {
    chai.request(server)
      .post('/api/auth/signup')
      .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('email');
        res.body.email.should.eql('User with this email is already exist!');
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
