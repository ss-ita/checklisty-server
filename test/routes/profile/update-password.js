/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Update user password', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .onFirstCall().throws()
      .returns({ password: 'oldPassword',  select: () => null });
    sinon.stub(mongoose.Model, 'findByIdAndUpdate').returns({})
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
    sinon.stub(bcrypt, 'compareSync')
      .onFirstCall().returns(false)
      .onSecondCall().returns(true);
    sinon.stub(Joi, 'validate')
      .onFirstCall().returns({ error: { details: [{ message: 'Validation error' }] } })
      .returns({ error: null });
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
    Joi.validate.restore();
    bcrypt.compareSync.restore();
  });

  it('Should reject, some error', () => {
    chai.request(server)
      .put('/api/profile/updatePassword')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('message');
        res.body.message.should.eql('Something go wrong');
      });
  });
  it('Should reject, same old and new password', () => {
    chai.request(server)
      .put('/api/profile/updatePassword')
      .set('access-token', 'token')
      .send({ oldPassword: 'Password', newPassword: 'Password' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.eql('Old and new passwords must be different!');
      });
  });
  it('Should reject, validation error', () => {
    chai.request(server)
      .put('/api/profile/updatePassword')
      .set('access-token', 'token')
      .send({ oldPassword: 'OldPassword', newPassword: 'Pas' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.eql('Validation error');
      });
  });
  it('Should reject, invalid old password', () => {
    chai.request(server)
      .put('/api/profile/updatePassword')
      .set('access-token', 'token')
      .send({ oldPassword: 'old', newPassword: 'newPassword' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.eql('Invalid old password!');
      });
  });
  it('Should update password', () => {
    chai.request(server)
      .put('/api/profile/updatePassword')
      .set('access-token', 'token')
      .send({ newPassword: 'newPassword' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.message.should.eql('Password changed!');
      });
  });
});
