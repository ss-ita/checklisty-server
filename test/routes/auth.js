const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

let user;

const server = require('../../index');

chai.use(chaiHttp);

describe('Authorization', () => {
    beforeEach((done) => {
        
        done();
    });

    describe('Sign up', () => {
        it('Should create user', (done) => {
            user = {

            };

            chai.request(server)
                .post('/api/auth/signup')
                .end((err ,res) => {
                    console.log(res.status);
                })
        })
    })
});
