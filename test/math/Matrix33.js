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
			
			assert.equal(true, glacier.compare(arr, mat33.array));
		});
		
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(arr);
			
			assert.equal(true, glacier.compare(arr, mat33.array));
		});
		
		it('number', function() {
			var num = 1.1, mat33 = new glacier.Matrix33(num);
			
			assert.equal(true, glacier.compare(num, mat33.array));
		});
		
		it('Matrix33', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(new glacier.Matrix33(arr));
			
			assert.equal(true, glacier.compare(arr, mat33.array));
		});
		
		it('Matrix44', function() {
			var arr44 = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat44 = new glacier.Matrix44(arr44);
			var mat33 = new glacier.Matrix33(mat44);
			
			assert.equal(true, glacier.compare(arr33, mat33.array));
		});
	});
	
	describe('assign', function() {
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33();
			
			mat33.assign(arr);
			
			assert.equal(true, glacier.compare(arr, mat33.array));
		});
		
		it('number', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(num);
			
			assert.equal(true, glacier.compare(num, mat33.array));
		});
		
		it('Matrix33', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(new glacier.Matrix33(num));
			
			assert.equal(true, glacier.compare(num, mat33.array));
		});
		
		it('Matrix44', function() {
			var num = 1.1, mat33 = new glacier.Matrix33();
			
			mat33.assign(new glacier.Matrix44(num));
			
			assert.equal(true, glacier.compare(num, mat33.array));
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
	
	describe('element', function() {
		it('number (column), number (row)', function() {
			var mat33 = new glacier.Matrix33([ 0.0, 0.1, 0.2, 1.0, 1.1, 1.2, 2.0, 2.1, 2.2 ]);
			
			assert.equal(true, glacier.compare(mat33.element(2, 1), 2.1));
			
		});
		
		it('number (index)', function() {
			var mat33 = new glacier.Matrix33([ 0.0, 0.1, 0.2, 1.0, 1.1, 1.2, 2.0, 2.1, 2.2 ]);
			
			assert.equal(true, glacier.compare(mat33.element(8), 2.2));
		});
	});
	
	describe('multiply', function() {
		it('Matrix33', function() {
			var arr1 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var arr2 = [ 3.3, 3.2, 3.1, 2.3, 2.2, 2.1, 1.3, 1.2, 1.1 ];
			var mat33 = new glacier.Matrix33(arr1);
			
			mat33.multiply(new glacier.Matrix33(arr2));
			
			assert.equal(true, glacier.compare(mat33.element(0), (arr1[0] * arr2[0]) + (arr1[1] * arr2[3]) + (arr1[2] * arr2[6])));
			assert.equal(true, glacier.compare(mat33.element(1), (arr1[0] * arr2[1]) + (arr1[1] * arr2[4]) + (arr1[2] * arr2[7])));
			assert.equal(true, glacier.compare(mat33.element(2), (arr1[0] * arr2[2]) + (arr1[1] * arr2[5]) + (arr1[2] * arr2[8])));
			assert.equal(true, glacier.compare(mat33.element(3), (arr1[3] * arr2[0]) + (arr1[4] * arr2[3]) + (arr1[5] * arr2[6])));
			assert.equal(true, glacier.compare(mat33.element(4), (arr1[3] * arr2[1]) + (arr1[4] * arr2[4]) + (arr1[5] * arr2[7])));
			assert.equal(true, glacier.compare(mat33.element(5), (arr1[3] * arr2[2]) + (arr1[4] * arr2[5]) + (arr1[5] * arr2[8])));
			assert.equal(true, glacier.compare(mat33.element(6), (arr1[6] * arr2[0]) + (arr1[7] * arr2[3]) + (arr1[8] * arr2[6])));
			assert.equal(true, glacier.compare(mat33.element(7), (arr1[6] * arr2[1]) + (arr1[7] * arr2[4]) + (arr1[8] * arr2[7])));
			assert.equal(true, glacier.compare(mat33.element(8), (arr1[6] * arr2[2]) + (arr1[7] * arr2[5]) + (arr1[8] * arr2[8])));
		});
		
		it('Matrix44', function() {
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var arr44 = [ 4.4, 4.3, 4.2, 4.1, 3.4, 3.3, 3.2, 3.1, 2.4, 2.3, 2.2, 2.1, 1.4, 1.3, 1.2, 1.1 ];
			var mat33 = new glacier.Matrix33(arr33);
			
			mat33.multiply(new glacier.Matrix44(arr44));
			
			assert.equal(true, glacier.compare(mat33.element(0), (arr33[0] * arr44[0]) + (arr33[1] * arr44[4]) + (arr33[2] * arr44[ 8])));
			assert.equal(true, glacier.compare(mat33.element(1), (arr33[0] * arr44[1]) + (arr33[1] * arr44[5]) + (arr33[2] * arr44[ 9])));
			assert.equal(true, glacier.compare(mat33.element(2), (arr33[0] * arr44[2]) + (arr33[1] * arr44[6]) + (arr33[2] * arr44[10])));
			assert.equal(true, glacier.compare(mat33.element(3), (arr33[3] * arr44[0]) + (arr33[4] * arr44[4]) + (arr33[5] * arr44[ 8])));
			assert.equal(true, glacier.compare(mat33.element(4), (arr33[3] * arr44[1]) + (arr33[4] * arr44[5]) + (arr33[5] * arr44[ 9])));
			assert.equal(true, glacier.compare(mat33.element(5), (arr33[3] * arr44[2]) + (arr33[4] * arr44[6]) + (arr33[5] * arr44[10])));
			assert.equal(true, glacier.compare(mat33.element(6), (arr33[6] * arr44[0]) + (arr33[7] * arr44[4]) + (arr33[8] * arr44[ 8])));
			assert.equal(true, glacier.compare(mat33.element(7), (arr33[6] * arr44[1]) + (arr33[7] * arr44[5]) + (arr33[8] * arr44[ 9])));
			assert.equal(true, glacier.compare(mat33.element(8), (arr33[6] * arr44[2]) + (arr33[7] * arr44[6]) + (arr33[8] * arr44[10])));
		});
		
		it('number (scalar)', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ], num = 8.9;
			var mat33 = new glacier.Matrix33(arr);
			
			mat33.multiply(num);
			
			assert.equal(true, glacier.compare(mat33.element(0), arr[0] * num));
			assert.equal(true, glacier.compare(mat33.element(1), arr[1] * num));
			assert.equal(true, glacier.compare(mat33.element(2), arr[2] * num));
			assert.equal(true, glacier.compare(mat33.element(3), arr[3] * num));
			assert.equal(true, glacier.compare(mat33.element(4), arr[4] * num));
			assert.equal(true, glacier.compare(mat33.element(5), arr[5] * num));
			assert.equal(true, glacier.compare(mat33.element(6), arr[6] * num));
			assert.equal(true, glacier.compare(mat33.element(7), arr[7] * num));
			assert.equal(true, glacier.compare(mat33.element(8), arr[8] * num));
		});
	});
	
	describe('transpose', function() {
		it('', function() {
			var arr = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(arr);
			
			mat33.transpose();
			
			assert.equal(true, glacier.compare(mat33.element(0), arr[0]));
			assert.equal(true, glacier.compare(mat33.element(1), arr[3]));
			assert.equal(true, glacier.compare(mat33.element(2), arr[6]));
			assert.equal(true, glacier.compare(mat33.element(3), arr[1]));
			assert.equal(true, glacier.compare(mat33.element(4), arr[4]));
			assert.equal(true, glacier.compare(mat33.element(5), arr[7]));
			assert.equal(true, glacier.compare(mat33.element(6), arr[2]));
			assert.equal(true, glacier.compare(mat33.element(7), arr[5]));
			assert.equal(true, glacier.compare(mat33.element(8), arr[8]));
		});
	});
	
	describe('invert', function() {
		it('', function() {
			var arr = [ 2.0, 1.5, 1.0, 4.4, -2.6, 5.0, 2.2, 8.4, 7.5 ];
			var mat1 = new glacier.Matrix33(arr);
			var mat2 = new glacier.Matrix33();
			
			assert.equal(true, glacier.compare(mat1.multiply(mat1.inverse()).array, mat2.array));
		});
	});
});
