describe('Matrix33', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Matrix33);
		assert.equal(true, new glacier.Matrix33 instanceof glacier.Matrix33);
	});
	
	describe('constructor', function() {
		it('default', function() {
			var arr = [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ];
			var mat33 = new glacier.Matrix33();
			
			assert.equal(true, glacier.compare(arr, mat33.toArray()));
		});
		
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(arr);
			
			assert.equal(true, glacier.compare(arr, mat33.toArray()));
		});
		
		it('number', function() {
			var num = 1.1, mat33 = new glacier.Matrix33(num);
			
			assert.equal(true, glacier.compare(num, mat33.toArray()));
		});
		
		it('Matrix33', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(new glacier.Matrix33(arr));
			
			assert.equal(true, glacier.compare(arr, mat33.toArray()));
		});
		
		it('Matrix44', function() {
			var arr44 = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat44 = new glacier.Matrix44(arr44);
			var mat33 = new glacier.Matrix33(mat44);
			
			assert.equal(true, glacier.compare(arr33, mat33.toArray()));
		});
	});
	
	describe('assign', function() {
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33();
			
			mat33.assign(arr);
			
			assert.equal(true, glacier.compare(arr, mat33.toArray()));
		});
		
		it('number', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(num);
			
			assert.equal(true, glacier.compare(num, mat33.toArray()));
		});
		
		it('Matrix33', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(new glacier.Matrix33(num));
			
			assert.equal(true, glacier.compare(num, mat33.toArray()));
		});
		
		it('Matrix44', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(new glacier.Matrix44(num));
			
			assert.equal(true, glacier.compare(num, mat33.toArray()));
		});
	});
	
	describe('determinant', function() {
		it('', function() {
			var arr = [ 2.0, 1.5, 1.0, 4.4, -2.6, 5.0, 2.2, 8.4, 7.5 ];
			var mat33 = new glacier.Matrix33(arr);

			var det = (arr[0] * (arr[4] * arr[8] - arr[5] * arr[7])) - (arr[1] * (arr[3] * arr[8] - arr[5] * arr[6])) + (arr[2] * (arr[3] * arr[7] - arr[4] * arr[6]));
			
			assert.equal(true, glacier.compare(mat33.determinant(), det));
		});
	});
});
