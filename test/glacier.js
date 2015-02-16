var assert = require('assert');
var glacier = require('../dist/glacier.min.js');

describe('glacier', function() {
	it('compare', function() {
		var n1 = 123.45678, n2 = 123.45678, n3 = 123.456, n4 = 123;
		
		assert.equal(true, glacier.compare(n1, n2));
		assert.equal(false, glacier.compare(n2, n3));
		assert.equal(false, glacier.compare(n3, n4));
	});
});
