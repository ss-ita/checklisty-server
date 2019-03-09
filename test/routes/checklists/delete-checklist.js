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

describe('Delete checklist by id', () => {
  const checklist = { 
    title: 'Checklist_title',
    sections_data: [] 
  };
  
  before(() => {
    sinon.stub(mongoose.Model, 'findByIdAndDelete');
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
  });
  
  after(() => {
    mongoose.Model.findByIdAndDelete.restore();
    jwt.verify.restore();
  });

  it('shoud delete checklist and send 200 status', () => {
    mongoose.Model.findByIdAndDelete.returns(checklist);

    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.message.should.eql(`Deleted Check List Title: ${checklist.title}`);
      });
  });

  it('shoud not delete checklist and send 404 status', () => {
    mongoose.Model.findByIdAndDelete.returns(null);

    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
});