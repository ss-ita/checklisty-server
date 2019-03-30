/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Profile', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .onFirstCall().throws()
      .returns({ username: 'JonhDoe', email: 'email@email.com' });
    sinon.stub(mongoose.Model, 'findByIdAndUpdate')
      .returns({ select: () => 'user' });
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
    sinon.stub(Joi, 'validate')
      .onFirstCall().returns({ error: { details: [{ message: 'Validation error' }] } })
      .returns({ error: null });
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
    Joi.validate.restore();
  });

  it('Shoud reject, something go wrong', () => {
    chai.request(server)
      .put('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('message');
        res.body.message.should.eql('Something go wrong');
      });
  });
  it('Shoud reject, nothing changed', () => {
    chai.request(server)
      .put('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.have.property('message');
        res.body.message.should.eql('Nothing have changed!');
      });
  });
  it('Shoud reject, validate error', () => {
    chai.request(server)
      .put('/api/profile/')
      .set('access-token', 'token')
      .send({ username: 'JonhDoe', email: 'email' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.eql('Validation error');
      });
  });
  it('Shoud update user profile', () => {
    chai.request(server)
      .put('/api/profile/')
      .set('access-token', 'token')
      .send({ username: 'JonhDoe', email: 'email' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.should.have.property('updatedUser');
        res.body.message.should.eql('Name and email changed!');
      });
  });
});
