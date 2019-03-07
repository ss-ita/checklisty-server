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

describe('Authorisation Sign In', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findOne')
      .onCall(0).throws({ message: 'Some error' })
      .onCall(1).returns(null)
      .onCall(2).returns({})
      .onCall(3).returns({ password: 'password', generateAuthToken: () => true });
    sinon.stub(bcrypt, 'compareSync')
      .onFirstCall().returns(false)
      .onSecondCall().returns(true)
  });

  after(() => {
    mongoose.Model.findOne.restore();
    bcrypt.compareSync.restore();
  });
  it('Shold reject sign in, email and password are required', () => {
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
  it('Should reject with some error', () => {
    chai.request(server)
      .post('/api/auth/signin')
      .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Some error');
      });
  });
  it('Shold reject sign in, invalid email or password.', () => {
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
  it('Shold reject sign in in bcrypt, invalid email or password.', () => {
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
  it('Shold sign in', () => {
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
