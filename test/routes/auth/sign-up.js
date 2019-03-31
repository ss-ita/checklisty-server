/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const Joi = require('joi');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Sign Up', () => {
  const userData = {
    username: 'nikname', 
    firstname: 'Jonh',
    lastname: 'Doe',
    email: 'JonhDoe@email.com', 
    password: '123456' 
  };
  let userFind;

  before(() => {
    userFind = sinon.stub(mongoose.Model, 'findOne');
    sinon.stub(Joi, 'validate')
      .onFirstCall().returns({ error: { details: [{ message: 'Validation error' }] } })
      .returns({ error: null });
    sinon.stub(mongoose.Model.prototype, 'save');
  });

  after(() => {
    userFind.restore();
    Joi.validate.restore();
    mongoose.Model.prototype.save.restore();
  });

  it('Shold reject, validation error', () => {
    chai.request(server)
      .post('/api/auth/signup')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Validation error');
      });
  });
  it('Shold reject, fill up all fields', () => {
    chai.request(server)
      .post('/api/auth/signup')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Should reject, username is already exist', () => {
    userFind.returns({});
    chai.request(server)
      .post('/api/auth/signup')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('User with this username is already exist!');
      });
  });
  it('Should reject, email is already exist', () => {
    userFind
      .returns({})
      .onSecondCall().returns();
    chai.request(server)
      .post('/api/auth/signup')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('User with this email is already exist!');
      });
  });
  it('Should sign up user', () => {
    userFind.returns();
    chai.request(server)
      .post('/api/auth/signup')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.should.have.property('user');
        res.body.message.should.eql('User created!');
        res.body.user.firstname.should.eql('Jonh');
      });
  });
});
