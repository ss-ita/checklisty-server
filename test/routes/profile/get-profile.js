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
    sinon.stub(mongoose.Model, 'findById')
        .onFirstCall().returns({ select: () => { return { username: 'Jonh Doe' } } })
        .onSecondCall().returns({ select: () => null });
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
  });

  after(() => {
    mongoose.Model.findById.restore();
    jwt.verify.restore();
  });

  describe('Profile get', async () => {
    it('Shoud return profile', () => {
      chai.request(server)
        .get('/api/profile/')
        .set('access-token', 'token')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('username');
            res.body.username.should.eql('Jonh Doe');
        });
    });
    it('Shoud reject user not found', () => {
        chai.request(server)
          .get('/api/profile/')
          .set('access-token', 'token')
          .end((err, res) => {
              res.should.have.status(404);
              res.body.should.have.property('message');
              res.body.message.should.eql('User not found!');
          });
      });
  });
});
