describe('Matrix44', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Matrix44);
		assert.equal(true, new glacier.Matrix44 instanceof glacier.Matrix44);
	});
	
	describe('constructor', function() {
		it('default', function() {
			var arr = [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			var mat44 = new glacier.Matrix44();
			
			assert.equal(true, glacier.compare(arr, mat44.toArray()));
		});
		
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(arr);
			
			assert.equal(true, glacier.compare(arr, mat44.toArray()));
		});
		
		it('number', function() {
			var num = 1.1, mat44 = new glacier.Matrix44(num);
			
			assert.equal(true, glacier.compare(num, mat44.toArray()));
		});
		
		it('Matrix33', function() {
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var arr44 = [ 1.1, 1.2, 1.3, 0.0, 2.1, 2.2, 2.3, 0.0, 3.1, 3.2, 3.3, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			var mat33 = new glacier.Matrix33(arr33);
			var mat44 = new glacier.Matrix44(mat33);
			
			assert.equal(true, glacier.compare(arr44, mat44.toArray()));
		});
		
		it('Matrix44', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(new glacier.Matrix44(arr));
			
			assert.equal(true, glacier.compare(arr, mat44.toArray()));
		});
	});
	
	describe('assign', function() {
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44();
			
			mat44.assign(arr);
			
			assert.equal(true, glacier.compare(arr, mat44.toArray()));
		});
		
		it('number', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			
			mat44.assign(num);
			
			assert.equal(true, glacier.compare(num, mat44.toArray()));
		});
		
		it('Matrix33', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			var arr = [ 1.1, 1.1, 1.1, 0.0, 1.1, 1.1, 1.1, 0.0, 1.1, 1.1, 1.1, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			
			mat44.assign(new glacier.Matrix33(num));
			
			assert.equal(true, glacier.compare(num, mat44.toArray()));
		});
		
		it('Matrix44', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			
			mat44.assign(new glacier.Matrix44(num));
			
			assert.equal(true, glacier.compare(num, mat44.toArray()));
		});
	});
	
	describe('determinant', function() {
		it('', function() {
			var arr = [ 2.0, 1.5, 1.0, 4.4, -2.6, 5.0, 2.2, 8.4, 7.5, 2.2, 6.0, 5.6, 4.2, 8.0, 2.6, -1.2 ];
			var mat44 = new glacier.Matrix44(arr);
			
			var detA = (arr[ 5] * (arr[10] * arr[15] - arr[11] * arr[14])) - (arr[ 6] * (arr[ 9] * arr[15] - arr[11] * arr[13])) + (arr[ 7] * (arr[ 9] * arr[14] - arr[10] * arr[13]));
			var detB = (arr[ 4] * (arr[10] * arr[15] - arr[11] * arr[14])) - (arr[ 6] * (arr[ 8] * arr[15] - arr[11] * arr[12])) + (arr[ 7] * (arr[ 8] * arr[14] - arr[10] * arr[12]));
			var detC = (arr[ 4] * (arr[ 9] * arr[15] - arr[11] * arr[13])) - (arr[ 5] * (arr[ 8] * arr[15] - arr[11] * arr[12])) + (arr[ 7] * (arr[ 8] * arr[13] - arr[ 9] * arr[12]));
			var detD = (arr[ 4] * (arr[ 9] * arr[14] - arr[10] * arr[13])) - (arr[ 5] * (arr[ 8] * arr[14] - arr[10] * arr[12])) + (arr[ 6] * (arr[ 8] * arr[13] - arr[ 9] * arr[12]));
			
			assert.equal(true, glacier.compare(mat44.determinant(), arr[0] * detA - arr[1] * detB + arr[2] * detC - arr[3] * detD));
		});
	});
});
