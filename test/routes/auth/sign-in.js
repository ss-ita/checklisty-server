/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Sign In', () => {
  let user;
  let bcryptStubbed;
  before(() => {
    user = sinon.stub(mongoose.Model, 'findOne');
    bcryptStubbed = sinon.stub(bcrypt, 'compareSync');
  });

  after(() => {
    user.restore();
    bcryptStubbed.restore();
  });

  it('Shold reject, email and password are required', () => {
    chai.request(server)
      .post('/api/auth/signin')
      .send({ email: 'email' })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Email and password are required!');
      });
  });
  it('Should reject, not valid data', () => {
    user.returns(null);
    chai.request(server)
      .post('/api/auth/signin')
      .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Invalid email or password!');
      });
  });
  it('Shold reject sign in bcrypt not valid.', () => {
    user.returns({ email: 'email', password: 'password' });
    bcryptStubbed.returns(false);
    chai.request(server)
      .post('/api/auth/signin')
      .send({ email: 'email', password: 'password' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Invalid email or password!');
      });
  });
  it('Shold reject, user is blocked', () => {
    user.returns({ email: 'email', password: 'password', isBlocked: true });
    bcryptStubbed.returns(true);
    chai.request(server)
      .post('/api/auth/signin')
      .send({ email: 'email', password: 'password' })
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('You can not login because you are blocked!');
      });
  });
  it('Shold sign in', () => {
    user.returns({ email: 'email', password: 'password', generateAuthToken: () => true  });
    bcryptStubbed.returns(true);
    chai.request(server)
      .post('/api/auth/signin')
      .send({ email: 'email', password: 'password' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('user');
        res.body.user.password.should.eql('');
      });
  });
});
