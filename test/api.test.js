'use strict';

const app = require('../index');
const chai = require('chai');
const expect = require('chai').expect;

// Chai setup
chai.use(require('chai-http'));

// Top-level test block
describe('Zastupovani API - Integration', () => {
	describe('GET /api/data', () => {
		it('should return data in JSON', (done) => {
			chai
				.request(app)
				.get('/api/data')
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					// TODO: replace the following with json-schema validation
					expect(res.body.classes).to.be.instanceof(Array);
					expect(res.body.suplovani).to.be.instanceof(Array);
					done();
				});
		});
	});
});