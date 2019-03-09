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

describe('Authorisation Validate', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .onFirstCall().returns({ select: () => 'user' })
      .onSecondCall().throws({ message: 'Some error' })
    sinon.stub(jwt, 'verify').returns('token');
  });

  after(() => {
    mongoose.Model.findById.restore();
    jwt.verify.restore();
  });

  it('Shold reject validation, token not found', () => {
    chai.request(server)
      .post('/api/auth/validate')
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Token not found!');
      });
  });

  // it('Should reject with some error', () => {
  //   chai.request(server)
  //     .post('/api/auth/signup')
  //     .send({ username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' })
  //     .end((err, res) => {
  //       res.should.have.status(500);
  //       res.body.should.be.a('object');
  //       res.body.should.have.property('message');
  //       res.body.message.should.eql('Some error');
  //     });
  // });

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
