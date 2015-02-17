describe('math', function() {
	describe('compare', function() {
		it('number, number', function() {
			var n1 = 123.45678, n2 = 123.45678, n3 = 123.456, n4 = 123;
			
			assert.equal(true, glacier.compare(n1, n2));
			assert.equal(false, glacier.compare(n2, n3));
			assert.equal(false, glacier.compare(n3, n4));
		});
		
		it('array, array', function() {
			var a1 = [ 1.1, 2.2, 3.3 ], a2 = new Float32Array([ 1.1, 2.2, 3.3 ]), a3 = [ 1, 2, 3 ], a4 = new Float32Array([ 1, 2, 3 ]);
			
			assert.equal(true, glacier.compare(a1, a2));
			assert.equal(true, glacier.compare(a3, a4));
			assert.equal(false, glacier.compare(a1, a3));
			assert.equal(false, glacier.compare(a2, a4));
		});
		
		it('array, number', function() {
			var a1 = [ 1.1, 1.1, 1.1 ], a2 = new Float32Array([ 2.2, 2.2, 2.2 ]), n1 = 1.1, n2 = 2.2, n3 = 1, n4 = 2;
			
			assert.equal(true, glacier.compare(a1, n1));
			assert.equal(true, glacier.compare(a2, n2));
			assert.equal(false, glacier.compare(a1, n3));
			assert.equal(false, glacier.compare(a2, n4));
		});
		
		it('array, boolean', function() {
			var a = [ true, true, true ], t = true, f = false, o = 1, z = 0;
			
			assert.equal(true, glacier.compare(a, t));
			assert.equal(false, glacier.compare(a, f));
			assert.equal(false, glacier.compare(a, o));
			assert.equal(false, glacier.compare(a, z));
		});
	});
});
