/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const server = require('../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Middleware, auth check', () => {
  let user;
  before(() => {
    user = sinon.stub(mongoose.Model, 'findById');
    sinon.stub(jwt, 'verify').returns({ userData: {} });
  });

  after(() => {
    user.restore();
    jwt.verify.restore();
  });

  it('Should reject, access-token is absent', () => {
    chai.request(server)
      .get('/api/profile/')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('message');
        res.body.message.should.eql('Access token is absent!');
      });
  });
  it('Should reject, something go wrong', () => {
    chai.request(server)
      .get('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('message');
        res.body.message.should.eql('Something go wrong');
      });
  });
  it('Should reject, user is blocked', () => {
    user.returns({ isBlocked: true });
    chai.request(server)
      .get('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.eql('You are blocked!');
      });
  });
  it('Should pass in user', () => {
    user.returns({ isBlocked: false });
    chai.request(server)
      .get('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
});
