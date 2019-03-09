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

describe('Get checklist by id', () => {
  const checklist = {
    title: 'Checklist_title',
    sections_data: [{
      section_title: 'section_title',
      items_data: [{
        item_title: 'item_title',
        description: 'description',
        priority: 2
      }]
    }]
  };

  before(() => {
    sinon.stub(mongoose.Model, 'findOne');
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
  });

  after(() => {
    mongoose.Model.findOne.restore();
    jwt.verify.restore();
  });

  it('shoud return checklist and send 200 status', () => {
    mongoose.Model.findOne.returns(checklist);

    chai.request(server)
      .get('/api/checklists/id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.to.deep.equal(checklist);
      });
  });

  it('should not return checklist and send 404 status', () => {
    mongoose.Model.findOne.returns(null);

    chai.request(server)
      .get('/api/checklists/id')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
});
