/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Profile', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById').returns({ user: { username: 'JonhDoe', email: 'email' } });
    sinon.stub(mongoose.Model, 'findByIdAndUpdate')
      .onFirstCall().returns({ select: () => 'user' })
      .onSecondCall().throws({ name: 'ValidationError' });
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
  });

  describe('Profile update', async () => {
    it('Shoud update profile', () => {
      chai.request(server)
        .put('/api/profile/')
        .set('access-token', 'token')
        .send({ username: 'JonhDoe', email: 'email' })
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('message');
            res.body.message.should.eql('Name and email changed!');
        });
    });
    it('Shoud reject to update with message to fill all fields', () => {
      chai.request(server)
        .put('/api/profile/')
        .set('access-token', 'token')
        .send({})
        .end((err, res) => {
            res.should.have.status(409);
            res.body.should.have.property('message');
            res.body.message.should.eql('Please fill the form!');
        });
    });
    it('Shoud reject with validate error', () => {
      chai.request(server)
        .put('/api/profile/')
        .set('access-token', 'token')
        .send({ username: 'JonhDoe', email: 'email' })
        .end((err, res) => {
            res.should.have.status(409);
            res.body.should.have.property('name');
            res.body.name.should.eql('ValidationError');
        });
    });
  });
});
