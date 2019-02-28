/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../index');
const User = require('../api/models/user-model');

chai.use(chaiHttp);

const should = chai.should();

describe('Authorization', () => {
    before((done) => {
        sinon.stub(mongoose.Model, 'findOne')
            .onFirstCall().returns(null)
            .onSecondCall().returns(null);
        sinon.stub(mongoose.Model.prototype, 'save');
        done();
    });

    describe('Sign up', async () => {
        it('Should create user', (done) => {
            const user = { username: 'JonhDoe', email: 'JonhDoe@email.com', password: '123456' };

            chai.request(server)
                .post('/api/auth/signup')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('username').eql('JonhDoe')
                });

            done();
        });
    });
});
