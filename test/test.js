var assert = require('assert');
var glacier = require('../dist/glacier.min.js');

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
	
	describe('degToRad', function() {
		it('number (degrees)', function() {
			var deg = 90.0, rad = Math.PI / 2;
			
			assert.equal(true, glacier.compare(rad, glacier.degToRad(deg)));
		});
	});
	
	describe('radToDeg', function() {
		it('number (radians)', function() {
			var rad = Math.PI / 2, deg = 90.0;
			
			assert.equal(true, glacier.compare(deg, glacier.radToDeg(rad)));
		});
	});
	
	describe('limitAngle', function() {
		it('number', function() {
			assert.equal(true, glacier.compare(180.0, glacier.limitAngle(540.0)));
			assert.equal(true, glacier.compare(270.0, glacier.limitAngle(-90.0)));
			
			assert.equal(true, glacier.compare(270.0, glacier.limitAngle(-90.0)));
			assert.equal(true, glacier.compare(270.0, glacier.limitAngle(-90.0)));
			
			assert.equal(true, glacier.compare(15.0, glacier.limitAngle(195.0, 60.0)));
			assert.equal(true, glacier.compare(45.0, glacier.limitAngle(-15.0, 60.0)));
		});
	});
	
	describe('clamp', function() {
		it('number', function() {
			assert.equal(true, glacier.compare(300.0, glacier.clamp(400.0, 100.0, 300.0)));
			assert.equal(true, glacier.compare(200.0, glacier.clamp(200.0, 100.0, 300.0)));
			assert.equal(true, glacier.compare(100.0, glacier.clamp(-50.0, 100.0, 300.0)));
			assert.equal(true, glacier.compare(-50.0, glacier.clamp(100.0, -50.0, -80.0)));
		});
	});
});

describe('Matrix33', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Matrix33);
		assert.equal(true, new glacier.Matrix33 instanceof glacier.Matrix33);
	});
	
	describe('(constructor)', function() {
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
	
	describe('array', function() {
		it('', function() {
			var arr33 = [ 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3 ];
			var mat33 = new glacier.Matrix33(arr33);
			var arr = mat33.array;
			
			assert.equal(true, (arr instanceof Float32Array));
			assert.equal(true, glacier.compare(arr33, arr));
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
			
			assert.equal(true, glacier.compare(mat33.determinant, det));
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
	
	describe('invert', function() {
		it('', function() {
			var arr = [ 2.0, 1.5, 1.0, 4.4, -2.6, 5.0, 2.2, 8.4, 7.5 ];
			var mat1 = new glacier.Matrix33(arr);
			var mat2 = new glacier.Matrix33();
			
			assert.equal(true, glacier.compare(mat1.multiply(mat1.inverse).array, mat2.array));
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
});

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

describe('Vector2', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Vector2);
		assert.equal(true, new glacier.Vector2 instanceof glacier.Vector2);
	});
	
	describe('(constructor)', function() {
		it('default', function() {
			var vec2 = new glacier.Vector3();
			
			assert.equal(true, glacier.compare(0.0, vec2.x));
			assert.equal(true, glacier.compare(0.0, vec2.y));
		});
		
		it('Vector2', function() {
			var x = 1.0, y = 2.0;
			var vec2 = new glacier.Vector2(new glacier.Vector2(x, y));
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
		});
		
		it('number (scalar)', function() {
			var xy = 123.456;
			var vec2 = new glacier.Vector2(xy);
			
			assert.equal(true, glacier.compare(xy, vec2.x));
			assert.equal(true, glacier.compare(xy, vec2.y));
		});
		
		it('number (x), number (y)', function() {
			var x = 1.1, y = 2.2;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
		});
	});
	
	describe('add', function() {
		it('Vector2', function() {
			var x1 = 1.1, y1 = 2.5, x2 = 3.0, y2 = 4.4;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.add(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 + x2, vec2.x));
			assert.equal(true, glacier.compare(y1 + y2, vec2.y));
		});
		
		it('number (scalar)', function() {
			var x = 1.2, y = 2.6, n = 3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec2.x));
			assert.equal(true, glacier.compare(y + n, vec2.y));
		});
	});
	
	describe('array', function() {
		it('', function() {
			var vec2 = new glacier.Vector2(1.1, 2.2);
			var arr = vec2.array;
			
			assert.equal(true, (arr instanceof Float32Array));
			assert.equal(true, glacier.compare(arr[0], vec2.x));
			assert.equal(true, glacier.compare(arr[1], vec2.y));
		});
	});
	
	describe('assign', function() {
		it('Vector2', function() {
			var x = 1.0, y = 2.0;
			var vec2 = new glacier.Vector2();
			
			vec2.assign(new glacier.Vector2(x, y));
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
		});
		
		it('number (scalar)', function() {
			var xy = 123.456;
			var vec2 = new glacier.Vector2();
			
			vec2.assign(xy);
			
			assert.equal(true, glacier.compare(xy, vec2.x));
			assert.equal(true, glacier.compare(xy, vec2.y));
		});
		
		it('number (x), number (y)', function() {
			var x = 1.1, y = 2.2;
			var vec2 = new glacier.Vector2();
			
			vec2.assign(x, y);
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
		});
	});
	
	describe('copy', function() {
		it('', function() {
			var x = 1.1, y = 2.2, add = 3.3;
			var vec2 = new glacier.Vector2(x, y);
			var copy = vec2.copy.add(add);
			
			assert.equal(true, glacier.compare(x + add, copy.x));
			assert.equal(true, glacier.compare(y + add, copy.y));
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
		});
	});
	
	describe('distance', function() {
		it('Vector2', function() {
			var x1 = -2.2, y1 = 3.6, x2 = 8.2, y2 = -5.4;
			var vec2 = new glacier.Vector2(x1, y1);
			var dist = vec2.distance(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)), dist));
		});
	});
	
	describe('divide', function() {
		it('Vector2', function() {
			var x1 = -6.1, y1 = 2.6, x2 = 3.3, y2 = -2.7;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.divide(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 / x2, vec2.x));
			assert.equal(true, glacier.compare(y1 / y2, vec2.y));
		});
		
		it('number (scalar)', function() {
			var x = -6.7, y = 3.2, n = 4.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec2.x));
			assert.equal(true, glacier.compare(y / n, vec2.y));
		});
	});
	
	describe('dot', function() {
		it('Vector2', function() {
			var x1 = 2.7, y1 = 4.2, x2 = 6.1, y2 = -3.5;
			var vec2 = new glacier.Vector2(x1, y1);
			var dot = vec2.dot(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare((x1 * x2) + (y1 * y2), dot));
		});
	});
	
	describe('length', function() {
		it('', function() {
			var x = 4.7, y = -3.1;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), vec2.length));
		});
	});
	
	describe('multiply', function() {
		it('Vector2', function() {
			var x1 = -3.6, y1 = 1.3, x2 = 2.4, y2 = -4.2;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.multiply(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 * x2, vec2.x));
			assert.equal(true, glacier.compare(y1 * y2, vec2.y));
		});
		
		it('number (scalar)', function() {
			var x = 4.9, y = -3.7, n = 5.1;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.multiply(n);
			
			assert.equal(true, glacier.compare(x * n, vec2.x));
			assert.equal(true, glacier.compare(y * n, vec2.y));
		});
	});
	
	describe('normalize', function() {
		it('', function() {
			var vec2 = new glacier.Vector2(5.5, -3.8).normalize();
			var len = vec2.length;
			
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('normalized', function() {
		it('', function() {
			var x = 5.5, y = -3.8;
			var vec2 = new glacier.Vector2(x, y);
			var len = vec2.normalized.length;
			
			assert.equal(true, glacier.compare(x, vec2.x));
			assert.equal(true, glacier.compare(y, vec2.y));
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('rotate', function() {
		it('number (radians)', function() {
			var x = -4.7, y = 2.3, n = 0.4;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.rotate(n);
			
			assert.equal(true, glacier.compare(vec2.x, (x * Math.cos(n)) - (y * Math.sin(n))));
			assert.equal(true, glacier.compare(vec2.y, (x * Math.sin(n)) + (y * Math.cos(n))));
		});
	});
	
	describe('subtract', function() {
		it('Vector2', function() {
			var x1 = 3.5, y1 = 1.7, x2 = -4.3, y2 = -2.7;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.subtract(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 - x2, vec2.x));
			assert.equal(true, glacier.compare(y1 - y2, vec2.y));
		});
		
		it('number (scalar)', function() {
			var x = -4.4, y = 3.6, n = -1.3;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec2.x));
			assert.equal(true, glacier.compare(y - n, vec2.y));
		});
	});
});

describe('Vector3', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Vector3);
		assert.equal(true, new glacier.Vector3 instanceof glacier.Vector3);
	});
	
	describe('(constructor)', function() {
		it('default', function() {
			var vec3 = new glacier.Vector3();
			
			assert.equal(true, glacier.compare(0.0, vec3.x));
			assert.equal(true, glacier.compare(0.0, vec3.y));
			assert.equal(true, glacier.compare(0.0, vec3.z));
		});
		
		it('Vector3', function() {
			var x = 1.0, y = 2.0, z = 3.0;
			var vec3 = new glacier.Vector3(new glacier.Vector3(x, y, z));
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
		
		it('Vector2, number (z)', function() {
			var x = 1.0, y = 2.0, z = 3.0;
			var vec3 = new glacier.Vector3(new glacier.Vector2(x, y), z);
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
		
		it('number (scalar)', function() {
			var xyz = 123.456;
			var vec3 = new glacier.Vector3(xyz);
			
			assert.equal(true, glacier.compare(xyz, vec3.x));
			assert.equal(true, glacier.compare(xyz, vec3.y));
			assert.equal(true, glacier.compare(xyz, vec3.z));
		});
		
		it('number (x), number (y), number (z)', function() {
			var x = 1.1, y = 2.2, z = 3.3;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
	});
	
	describe('add', function() {
		it('Vector3', function() {
			var x1 = 1.0, y1 = 2.2, z1 = 3.7, x2 = 4.0, y2 = 5.2, z2 = 6.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.add(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 + x2, vec3.x));
			assert.equal(true, glacier.compare(y1 + y2, vec3.y));
			assert.equal(true, glacier.compare(z1 + z2, vec3.z));
		});
		
		it('number (scalar)', function() {
			var x = 1.2, y = 2.5, z = 3.2, n = 4.9;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec3.x));
			assert.equal(true, glacier.compare(y + n, vec3.y));
			assert.equal(true, glacier.compare(z + n, vec3.z));
		});
	});
	
	describe('array', function() {
		it('', function() {
			var vec3 = new glacier.Vector3(1.1, 2.2, 3.3);
			var arr = vec3.array;
			
			assert.equal(true, (arr instanceof Float32Array));
			assert.equal(true, glacier.compare(arr[0], vec3.x));
			assert.equal(true, glacier.compare(arr[1], vec3.y));
			assert.equal(true, glacier.compare(arr[2], vec3.z));
		});
	});
	
	describe('assign', function() {
		it('Vector3', function() {
			var x = 1.0, y = 2.0, z = 3.0;
			var vec3 = new glacier.Vector3();
			
			vec3.assign(new glacier.Vector3(x, y, z));
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
		
		it('Vector2, number (z)', function() {
			var x = 1.0, y = 2.0, z = 3.0;
			var vec3 = new glacier.Vector3();
			
			vec3.assign(new glacier.Vector2(x, y), z);
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
		
		it('number (scalar)', function() {
			var xyz = 123.456;
			var vec3 = new glacier.Vector3();
			
			vec3.assign(xyz);
			
			assert.equal(true, glacier.compare(xyz, vec3.x));
			assert.equal(true, glacier.compare(xyz, vec3.y));
			assert.equal(true, glacier.compare(xyz, vec3.z));
		});
		
		it('number (x), number (y), number (z)', function() {
			var x = 1.1, y = 2.2, z = 3.3;
			var vec3 = new glacier.Vector3();
			
			vec3.assign(x, y, z);
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
	});
	
	describe('copy', function() {
		it('', function() {
			var x = 1.1, y = 2.2, z = 3.3, add = 4.4;
			var vec3 = new glacier.Vector3(x, y, z);
			var copy = vec3.copy.add(add);
			
			assert.equal(true, glacier.compare(x + add, copy.x));
			assert.equal(true, glacier.compare(y + add, copy.y));
			assert.equal(true, glacier.compare(z + add, copy.z));
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
		});
	});
	
	describe('distance', function() {
		it('Vector3', function() {
			var x1 = -2.5, y1 = 3.2, z1 = -4.8, x2 = 8.7, y2 = -5.4, z2 = 6.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			var dist = vec3.distance(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2)), dist));
		});
	});
	
	describe('divide', function() {
		it('Vector3', function() {
			var x1 = -6.5, y1 = 2.2, z1 = 3.0, x2 = -3.2, y2 = -2.4, z2 = 4.1;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.divide(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 / x2, vec3.x));
			assert.equal(true, glacier.compare(y1 / y2, vec3.y));
			assert.equal(true, glacier.compare(z1 / z2, vec3.z));
		});
		
		it('number (scalar)', function() {
			var x = -6.2, y = 3.7, z = -8.4, n = 2.1;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec3.x));
			assert.equal(true, glacier.compare(y / n, vec3.y));
			assert.equal(true, glacier.compare(z / n, vec3.z));
		});
	});
	
	describe('dot', function() {
		it('Vector3', function() {
			var x1 = 2.5, y1 = 4.3, z1 = -3.1, x2 = 6.0, y2 = -5.6, z2 = 8.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			var dot = vec3.dot(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare((x1 * x2) + (y1 * y2) + (z1 * z2), dot));
		});
	});
	
	describe('length', function() {
		it('', function() {
			var x = 4.5, y = -3.4, z = 2.8;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)), vec3.length));
		});
	});
	
	describe('multiply', function() {
		it('Vector3', function() {
			var x1 = -3.4, y1 = 1.1, z1 = 2.6, x2 = -2.8, y2 = -4.3, z2 = -1.8;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.multiply(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 * x2, vec3.x));
			assert.equal(true, glacier.compare(y1 * y2, vec3.y));
			assert.equal(true, glacier.compare(z1 * z2, vec3.z));
		});
		
		it('number (scalar)', function() {
			var x = 4.6, y = -3.1, z = 6.8, n = 5.2;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.multiply(n);
			
			assert.equal(true, glacier.compare(x * n, vec3.x));
			assert.equal(true, glacier.compare(y * n, vec3.y));
			assert.equal(true, glacier.compare(z * n, vec3.z));
		});
	});
	
	describe('normalize', function() {
		it('', function() {
			var vec3 = new glacier.Vector2(5.5, -3.8, 2.7).normalize();
			var len = vec3.length;
			
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('normalized', function() {
		it('', function() {
			var x = 5.5, y = -3.8, z = 2.7;
			var vec3 = new glacier.Vector3(x, y, z);
			var len = vec3.normalized.length;
			
			assert.equal(true, glacier.compare(x, vec3.x));
			assert.equal(true, glacier.compare(y, vec3.y));
			assert.equal(true, glacier.compare(z, vec3.z));
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('rotateX', function() {
		it('number (radians)', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateX(n);
			
			assert.equal(true, glacier.compare(vec3.y, (y * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.z, (y * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateY', function() {
		it('number (radians)', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateY(n);
			
			assert.equal(true, glacier.compare(vec3.x, (x * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.z, (x * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateZ', function() {
		it('number (radians)', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateZ(n);
			
			assert.equal(true, glacier.compare(vec3.x, (x * Math.cos(n)) - (y * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.y, (x * Math.sin(n)) + (y * Math.cos(n))));
		});
	});
	
	describe('subtract', function() {
		it('Vector3', function() {
			var x1 = 3.2, y1 = 1.0, z1 = -6.0, x2 = -4.4, y2 = -2.0, z2 = 2.0;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.subtract(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 - x2, vec3.x));
			assert.equal(true, glacier.compare(y1 - y2, vec3.y));
			assert.equal(true, glacier.compare(z1 - z2, vec3.z));
		});
		
		it('number (scalar)', function() {
			var x = -4.0, y = 3.0, z = 2.1, n = -1.8;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec3.x));
			assert.equal(true, glacier.compare(y - n, vec3.y));
			assert.equal(true, glacier.compare(z - n, vec3.z));
		});
	});
});
