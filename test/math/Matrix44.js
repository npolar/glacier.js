describe('Matrix44', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Matrix44);
		assert.equal(true, new glacier.Matrix44 instanceof glacier.Matrix44);
	});
	
	describe('(constructor)', function() {
		it('default', function() {
			var arr = [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			var mat44 = new glacier.Matrix44();
			
			assert.equal(true, glacier.compare(arr, mat44.array));
		});
		
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(arr);
			
			assert.equal(true, glacier.compare(arr, mat44.array));
		});
		
		it('number', function() {
			var num = 1.1, mat44 = new glacier.Matrix44(num);
			
			assert.equal(true, glacier.compare(num, mat44.array));
		});
		
		it('Matrix33', function() {
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var arr44 = [ 1.1, 1.2, 1.3, 0.0, 2.1, 2.2, 2.3, 0.0, 3.1, 3.2, 3.3, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			var mat33 = new glacier.Matrix33(arr33);
			var mat44 = new glacier.Matrix44(mat33);
			
			assert.equal(true, glacier.compare(arr44, mat44.array));
		});
		
		it('Matrix44', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(new glacier.Matrix44(arr));
			
			assert.equal(true, glacier.compare(arr, mat44.array));
		});
	});
	
	describe('array', function() {
		it('', function() {
			var arr44 = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(arr44);
			var arr = mat44.array;
			
			assert.equal(true, (arr instanceof Float32Array));
			assert.equal(true, glacier.compare(arr44, arr));
		});
	});
	
	describe('assign', function() {
		it('array', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44();
			
			mat44.assign(arr);
			
			assert.equal(true, glacier.compare(arr, mat44.array));
		});
		
		it('number', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			
			mat44.assign(num);
			
			assert.equal(true, glacier.compare(num, mat44.array));
		});
		
		it('Matrix33', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			var arr = [ 1.1, 1.1, 1.1, 0.0, 1.1, 1.1, 1.1, 0.0, 1.1, 1.1, 1.1, 0.0, 0.0, 0.0, 0.0, 1.0 ];
			
			mat44.assign(new glacier.Matrix33(num));
			
			assert.equal(true, glacier.compare(arr, mat44.array));
		});
		
		it('Matrix44', function() {
			var num = 1.1, mat44 = new glacier.Matrix44();
			
			mat44.assign(new glacier.Matrix44(num));
			
			assert.equal(true, glacier.compare(num, mat44.array));
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
			
			assert.equal(true, glacier.compare(mat44.determinant, arr[0] * detA - arr[1] * detB + arr[2] * detC - arr[3] * detD));
		});
	});
	
	describe('element', function() {
		it('number (column), number (row)', function() {
			var mat44 = new glacier.Matrix44([ 0.0, 0.1, 0.2, 0.3, 1.0, 1.1, 1.2, 1.3, 2.0, 2.1, 2.2, 2.3, 3.0, 3.1, 3.2, 3.3 ]);
			
			assert.equal(true, glacier.compare(mat44.element(3, 2), 3.2));
		});
		
		it('number (index)', function() {
			var mat44 = new glacier.Matrix44([ 0.0, 0.1, 0.2, 0.3, 1.0, 1.1, 1.2, 1.3, 2.0, 2.1, 2.2, 2.3, 3.0, 3.1, 3.2, 3.3 ]);
			
			assert.equal(true, glacier.compare(mat44.element(15), 3.3));
		});
	});
	
	describe('invert', function() {
		it('', function() {
			var arr = [ 2.0, 1.5, 1.0, 4.4, 2.5, -2.6, 5.0, 2.2, 8.4, 7.5, -4.0, 3.0, 1.0, 3.2, -2.0, 5.5 ];
			var mat1 = new glacier.Matrix44(arr);
			var mat2 = new glacier.Matrix44();
			
			assert.equal(true, glacier.compare(mat1.multiply(mat1.inverse).array, mat2.array));
		});
	});
	
	describe('multiply', function() {
		it('Matrix33', function() {
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var arr44 = [ 4.4, 4.3, 4.2, 4.1, 3.4, 3.3, 3.2, 3.1, 2.4, 2.3, 2.2, 2.1, 1.4, 1.3, 1.2, 1.1 ];
			var mat44 = new glacier.Matrix44(arr44);
			
			mat44.multiply(new glacier.Matrix33(arr33));
			
			assert.equal(true, glacier.compare(mat44.element( 0), (arr44[0] * arr33[0]) + (arr44[1] * arr33[3]) + (arr44[ 2] * arr33[6])));
			assert.equal(true, glacier.compare(mat44.element( 1), (arr44[0] * arr33[1]) + (arr44[1] * arr33[4]) + (arr44[ 2] * arr33[7])));
			assert.equal(true, glacier.compare(mat44.element( 2), (arr44[0] * arr33[2]) + (arr44[1] * arr33[5]) + (arr44[ 2] * arr33[8])));
			assert.equal(true, glacier.compare(mat44.element( 4), (arr44[4] * arr33[0]) + (arr44[5] * arr33[3]) + (arr44[ 6] * arr33[6])));
			assert.equal(true, glacier.compare(mat44.element( 5), (arr44[4] * arr33[1]) + (arr44[5] * arr33[4]) + (arr44[ 6] * arr33[7])));
			assert.equal(true, glacier.compare(mat44.element( 6), (arr44[4] * arr33[2]) + (arr44[5] * arr33[5]) + (arr44[ 6] * arr33[8])));
			assert.equal(true, glacier.compare(mat44.element( 8), (arr44[8] * arr33[0]) + (arr44[9] * arr33[3]) + (arr44[10] * arr33[6])));
			assert.equal(true, glacier.compare(mat44.element( 9), (arr44[8] * arr33[1]) + (arr44[9] * arr33[4]) + (arr44[10] * arr33[7])));
			assert.equal(true, glacier.compare(mat44.element(10), (arr44[8] * arr33[2]) + (arr44[9] * arr33[5]) + (arr44[10] * arr33[8])));
		});
		
		it('Matrix44', function() {
			var arr1 = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var arr2 = [ 4.4, 4.3, 4.2, 4.1, 3.4, 3.3, 3.2, 3.1, 2.4, 2.3, 2.2, 2.1, 1.4, 1.3, 1.2, 1.1 ];
			var mat44 = new glacier.Matrix44(arr1);
			
			mat44.multiply(new glacier.Matrix44(arr2));
			
			assert.equal(true, glacier.compare(mat44.element( 0), (arr1[ 0] * arr2[0]) + (arr1[ 1] * arr2[4]) + (arr1[ 2] * arr2[ 8]) + (arr1[ 3] * arr2[12])));
			assert.equal(true, glacier.compare(mat44.element( 1), (arr1[ 0] * arr2[1]) + (arr1[ 1] * arr2[5]) + (arr1[ 2] * arr2[ 9]) + (arr1[ 3] * arr2[13])));
			assert.equal(true, glacier.compare(mat44.element( 2), (arr1[ 0] * arr2[2]) + (arr1[ 1] * arr2[6]) + (arr1[ 2] * arr2[10]) + (arr1[ 3] * arr2[14])));
			assert.equal(true, glacier.compare(mat44.element( 3), (arr1[ 0] * arr2[3]) + (arr1[ 1] * arr2[7]) + (arr1[ 2] * arr2[11]) + (arr1[ 3] * arr2[15])));
			assert.equal(true, glacier.compare(mat44.element( 4), (arr1[ 4] * arr2[0]) + (arr1[ 5] * arr2[4]) + (arr1[ 6] * arr2[ 8]) + (arr1[ 7] * arr2[12])));
			assert.equal(true, glacier.compare(mat44.element( 5), (arr1[ 4] * arr2[1]) + (arr1[ 5] * arr2[5]) + (arr1[ 6] * arr2[ 9]) + (arr1[ 7] * arr2[13])));
			assert.equal(true, glacier.compare(mat44.element( 6), (arr1[ 4] * arr2[2]) + (arr1[ 5] * arr2[6]) + (arr1[ 6] * arr2[10]) + (arr1[ 7] * arr2[14])));
			assert.equal(true, glacier.compare(mat44.element( 7), (arr1[ 4] * arr2[3]) + (arr1[ 5] * arr2[7]) + (arr1[ 6] * arr2[11]) + (arr1[ 7] * arr2[15])));
			assert.equal(true, glacier.compare(mat44.element( 8), (arr1[ 8] * arr2[0]) + (arr1[ 9] * arr2[4]) + (arr1[10] * arr2[ 8]) + (arr1[11] * arr2[12])));
			assert.equal(true, glacier.compare(mat44.element( 9), (arr1[ 8] * arr2[1]) + (arr1[ 9] * arr2[5]) + (arr1[10] * arr2[ 9]) + (arr1[11] * arr2[13])));
			assert.equal(true, glacier.compare(mat44.element(10), (arr1[ 8] * arr2[2]) + (arr1[ 9] * arr2[6]) + (arr1[10] * arr2[10]) + (arr1[11] * arr2[14])));
			assert.equal(true, glacier.compare(mat44.element(11), (arr1[ 8] * arr2[3]) + (arr1[ 9] * arr2[7]) + (arr1[10] * arr2[11]) + (arr1[11] * arr2[15])));
			assert.equal(true, glacier.compare(mat44.element(12), (arr1[12] * arr2[0]) + (arr1[13] * arr2[4]) + (arr1[14] * arr2[ 8]) + (arr1[15] * arr2[12])));
			assert.equal(true, glacier.compare(mat44.element(13), (arr1[12] * arr2[1]) + (arr1[13] * arr2[5]) + (arr1[14] * arr2[ 9]) + (arr1[15] * arr2[13])));
			assert.equal(true, glacier.compare(mat44.element(14), (arr1[12] * arr2[2]) + (arr1[13] * arr2[6]) + (arr1[14] * arr2[10]) + (arr1[15] * arr2[14])));
			assert.equal(true, glacier.compare(mat44.element(15), (arr1[12] * arr2[3]) + (arr1[13] * arr2[7]) + (arr1[14] * arr2[11]) + (arr1[15] * arr2[15])));
		});
		
		it('number (scalar)', function() {
			var arr = [ 4.4, 4.3, 4.2, 4.1, 3.4, 3.3, 3.2, 3.1, 2.4, 2.3, 2.2, 2.1, 1.4, 1.3, 1.2, 1.1 ], num = 8.9;
			var mat44 = new glacier.Matrix44(arr);
			
			mat44.multiply(num);
			
			assert.equal(true, glacier.compare(mat44.element( 0), arr[ 0] * num));
			assert.equal(true, glacier.compare(mat44.element( 1), arr[ 1] * num));
			assert.equal(true, glacier.compare(mat44.element( 2), arr[ 2] * num));
			assert.equal(true, glacier.compare(mat44.element( 3), arr[ 3] * num));
			assert.equal(true, glacier.compare(mat44.element( 4), arr[ 4] * num));
			assert.equal(true, glacier.compare(mat44.element( 5), arr[ 5] * num));
			assert.equal(true, glacier.compare(mat44.element( 6), arr[ 6] * num));
			assert.equal(true, glacier.compare(mat44.element( 7), arr[ 7] * num));
			assert.equal(true, glacier.compare(mat44.element( 8), arr[ 8] * num));
			assert.equal(true, glacier.compare(mat44.element( 9), arr[ 9] * num));
			assert.equal(true, glacier.compare(mat44.element(10), arr[10] * num));
			assert.equal(true, glacier.compare(mat44.element(11), arr[11] * num));
			assert.equal(true, glacier.compare(mat44.element(12), arr[12] * num));
			assert.equal(true, glacier.compare(mat44.element(13), arr[13] * num));
			assert.equal(true, glacier.compare(mat44.element(14), arr[14] * num));
			assert.equal(true, glacier.compare(mat44.element(15), arr[15] * num));
		});
	});
	
	describe('transpose', function() {
		it('', function() {
			var arr = [ 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4 ];
			var mat44 = new glacier.Matrix44(arr);
			
			mat44.transpose();
			
			assert.equal(true, glacier.compare(mat44.element( 0), arr[ 0]));
			assert.equal(true, glacier.compare(mat44.element( 1), arr[ 4]));
			assert.equal(true, glacier.compare(mat44.element( 2), arr[ 8]));
			assert.equal(true, glacier.compare(mat44.element( 3), arr[12]));
			assert.equal(true, glacier.compare(mat44.element( 4), arr[ 1]));
			assert.equal(true, glacier.compare(mat44.element( 5), arr[ 5]));
			assert.equal(true, glacier.compare(mat44.element( 6), arr[ 9]));
			assert.equal(true, glacier.compare(mat44.element( 7), arr[13]));
			assert.equal(true, glacier.compare(mat44.element( 8), arr[ 2]));
			assert.equal(true, glacier.compare(mat44.element( 9), arr[ 6]));
			assert.equal(true, glacier.compare(mat44.element(10), arr[10]));
			assert.equal(true, glacier.compare(mat44.element(11), arr[14]));
			assert.equal(true, glacier.compare(mat44.element(12), arr[ 3]));
			assert.equal(true, glacier.compare(mat44.element(13), arr[ 7]));
			assert.equal(true, glacier.compare(mat44.element(14), arr[11]));
			assert.equal(true, glacier.compare(mat44.element(15), arr[15]));
		});
	});
});
