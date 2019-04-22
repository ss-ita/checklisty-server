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
  const deleted_checklist = {
    title: 'Checklist_title',
    sections_data: []
  };
  let copiedChecklist;
  before(() => {
    sinon.stub(mongoose.Model, 'findById');
    copiedChecklist = sinon.stub(mongoose.Model, 'findOneAndUpdate');
    sinon.stub(mongoose.Model, 'findByIdAndDelete');
    sinon.stub(jwt, 'verify').returns({ userData: {id: '1' } });
  });

  after(() => {
    mongoose.Model.findById.restore();
    copiedChecklist.restore();
    mongoose.Model.findByIdAndDelete.restore();
    jwt.verify.restore();
  });

  it('shoud delete copied checklist and send 200 status', () => {
    copiedChecklist.returns({ isBlocked: false, role: 'user'});
    mongoose.Model.findById.returns({ isBlocked: false, role: 'user'});
    mongoose.Model.findByIdAndDelete.returns(deleted_checklist);

    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.message.should.eql('Copied list deleted');
      });
  });

  it('shoud delete checklist and send 200 status', () => {
    copiedChecklist.returns(null);
    mongoose.Model.findById.returns({ isBlocked: false, role: 'moderator' });
    mongoose.Model.findByIdAndDelete.returns(deleted_checklist);

    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.message.should.eql(`Deleted list: ${deleted_checklist.title}`);
      });
  });
  
  it('shoud not delete checklist and send 404 status', () => {
    mongoose.Model.findById.returns({ isBlocked: false, role: 'moderator'});
    mongoose.Model.findByIdAndDelete.returns(null);

    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });

  it('should not delete checklist and send 403 status', () => {
    copiedChecklist.returns(null);
    mongoose.Model.findById.returns(deleted_checklist);
    mongoose.Model.findById.returns({ isBlocked: false, role: 'user'});
  
    chai.request(server)
      .delete('/api/checklists/:id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have.property('message');
        res.body.message.should.eql('Access denied!');
      });
  });
});
