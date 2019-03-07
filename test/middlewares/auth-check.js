/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Auth Check', () => {
  it('Should reject when access-token is absent', () => {
    chai.request(server)
      .put('/api/profile/')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('message');
        res.body.message.should.eql('Access token is absent!');
      });
  });

  it('Should reject with jwt malformed error', () => {
    chai.request(server)
      .put('/api/profile/')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.message.should.eql('jwt malformed');
      });
  });
});
