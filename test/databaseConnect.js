process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();

describe('База данных', ()=>{
	it('Промис должен быть resolved', done =>{
		let databasePath = require('path').join(__dirname, '..', 'core', 'database.js');
		const database = require(databasePath)();
		database.should.be.have.property('then');
		done();
	});
});