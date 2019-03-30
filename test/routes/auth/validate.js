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

describe('Validate user', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .onFirstCall().throws({ message: 'Some error' })
      .onSecondCall().returns({ select: () => 'user' });
    sinon.stub(jwt, 'verify').returns({ id: {} });
  });

  after(() => {
    mongoose.Model.findById.restore();
    jwt.verify.restore();
  });

  it('Shold reject, token not found', () => {
    chai.request(server)
      .post('/api/auth/validate')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Token not found!');
      });
  });
  it('Should reject with some error', () => {
    chai.request(server)
      .post('/api/auth/validate')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Some error');
      });
  });
  it('Shold validate user', () => {
    chai.request(server)
      .post('/api/auth/validate')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.should.eql('user');
      });
  });
});
