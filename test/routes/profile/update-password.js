/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Profile', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .returns({ password: 'oldPassword',  select: () => null });
    sinon.stub(mongoose.Model, 'findByIdAndUpdate').returns({})
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
    sinon.stub(bcrypt, 'compareSync')
      .onFirstCall().returns(false)
      .onSecondCall().returns(true);
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
    bcrypt.compareSync.restore();
  });

  describe('Update password', async () => {
    it('Should reject same old and new password', () => {
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

    it('Should reject with validation error', () => {
      chai.request(server)
        .put('/api/profile/updatePassword')
        .set('access-token', 'token')
        .send({ oldPassword: 'OldPassword', newPassword: 'Pas' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message');
          res.body.message.should.eql('"password" length must be at least 6 characters long');
        });
    });

    it('Should reject with messageq invalid old password', () => {
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
});
