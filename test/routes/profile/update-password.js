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
      .onFirstCall().returns({ password: 'oldPassword' })
      .onSecondCall().returns({ select: () => null });
    sinon.stub(mongoose.Model, 'findByIdAndUpdate').returns({})
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
    sinon.stub(bcrypt, 'compareSync')
      .onFirstCall().returns(false)
      .onSecondCall().returns(true);
    // sinon.stub(bcrypt, 'compareSync')
    //     .onFirstCall().returns(false)
    //     .onSecondCall().returns(true);
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
    bcrypt.compareSync.restore();
  });

  describe('Update password', async () => {
    it('Shoud reject with messageq invalid old password', () => {
      chai.request(server)
        .put('/api/profile/updatePassword')
        .set('access-token', 'token')
        .send({ oldPassword: 'old', newPassword: 'new' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('message');
          res.body.message.should.eql('Invalid old password!');
        });
    });
    it('Shoud update password', () => {
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
