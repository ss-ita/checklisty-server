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

describe('create checklist', () => {
  const checklist = {
    title: 'Checklist_title',
    sections_data: [{
      _id: 1,
      section_title: 'section_title',
      items_data: [{
        _id: 1,
        item_title: 'item_title',
        description: 'description',
        priority: 1
      }]
    }]
  };
  let user;
  let userTeam;
  before(() => {
    sinon.stub(mongoose.Model, 'findById');
    sinon.stub(mongoose.Model.prototype, 'save').returns(checklist);
    sinon.stub(jwt, 'verify').returns({ userData: { id: '1' } });
  });

  after(() => {
    mongoose.Model.findById.restore();
    mongoose.Model.prototype.save.restore();
    jwt.verify.restore();
  });

  it('should return an error if empty object passed', () => {
    mongoose.Model.findById.returns({ isBlocked: false });
    const data = {};
    chai.request(server)
      .post('/api/checklists/create')
      .set('access-token', 'token')
      .send(data)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('"Checklist title" is required');
      });
  });

  it('should return 403 status if user is not in a team', () => {
    mongoose.Model.findById.returns({ members: ['2'] });
    const data = { teamId: '1' };
    chai.request(server)
      .post('/api/checklists/create')
      .set('access-token', 'token')
      .send(data)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('You can not create checklist for the team you are not member of!');
      });
  });

  it('should create new checklist if valid data passed', () => {
    mongoose.Model.findById.returns({ isBlocked: false });
    chai.request(server)
      .post('/api/checklists/create')
      .set('access-token', 'token')
      .send(checklist)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.to.deep.equal(checklist);
      });
  });
});
