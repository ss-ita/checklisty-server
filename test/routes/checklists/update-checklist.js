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

describe('Update checklist by id', () => {
  const updated_checklist = { 
    title: 'Checklist_title2',
    sections_data: [{ 
      section_title: 'section_title2',
      items_data: [{ 
        item_title: 'item_title2',
        description: 'description2',
        priority: 2
      }]
    }] 
  };

  before(() => {
    sinon.stub(mongoose.Model, 'findByIdAndUpdate');
    sinon.stub(jwt, 'verify').returns({ decoded: { id: '1' } });
  });
    
  after(() => {
    mongoose.Model.findByIdAndUpdate.restore();
    jwt.verify.restore();
  });

  it('shoud update checklist and send 200 status', () => {
    mongoose.Model.findByIdAndUpdate.returns(updated_checklist);

    chai.request(server)
      .put('/api/checklists/id')
      .set('access-token', 'token')
      .send(updated_checklist)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message');
        res.body.message.should.eql('List updated');
        res.body.should.have.property('list');
        res.body.list.should.to.deep.equal(updated_checklist);
      });
  });

  it('should not update checklist and send 404 status', () => {
    mongoose.Model.findByIdAndUpdate.returns(null);

    chai.request(server)
      .put('/api/checklists/id')
      .set('access-token', 'token')
      .send({})
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
});
