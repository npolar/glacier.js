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
});

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
});

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
});

describe('Vector2', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Vector2);
		assert.equal(true, new glacier.Vector2 instanceof glacier.Vector2);
	});
	
	describe('constructor', function() {
		it('default', function() {
			var vec2 = new glacier.Vector2();
			
			assert.equal(true, glacier.compare(0.0, vec2.x));
			assert.equal(true, glacier.compare(0.0, vec2.y));
		});
		
		it('number, number', function() {
			var x = 1.6, y = 2.2;
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
		
		it('number', function() {
			var x = 1.2, y = 2.6, n = 3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec2.x));
			assert.equal(true, glacier.compare(y + n, vec2.y));
		});
	});
	
	describe('assign', function() {
		it('number, number', function() {
			var x1 = 1.5, y1 = 2.4, x2 = 3.7, y2 = 4.4;
			var vec2 = new glacier.Vector2(x1, x2);
			
			vec2.assign(x2, y2);
			
			assert.equal(true, glacier.compare(x2, vec2.x));
			assert.equal(true, glacier.compare(y2, vec2.y));
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
		
		it('number', function() {
			var x = -6.7, y = 3.2, n = 4.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec2.x));
			assert.equal(true, glacier.compare(y / n, vec2.y));
		});
	});
	
	describe('dotProduct', function() {
		it('Vector2', function() {
			var x1 = 2.7, y1 = 4.2, x2 = 6.1, y2 = -3.5;
			var vec2 = new glacier.Vector2(x1, y1);
			var dot = vec2.dotProduct(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare((x1 * x2) + (y1 * y2), dot));
		});
	});
	
	describe('length', function() {
		it('', function() {
			var x = 4.7, y = -3.1;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), vec2.length()));
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
		
		it('number', function() {
			var x = 4.9, y = -3.7, n = 5.1;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.multiply(n);
			
			assert.equal(true, glacier.compare(x * n, vec2.x));
			assert.equal(true, glacier.compare(y * n, vec2.y));
		});
	});
	
	describe('normalize', function() {
		it('', function() {
			var x = 5.5, y = -3.8;
			var vec2 = new glacier.Vector2(x, y);
			var len = vec2.normalize().length();
			
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('rotate', function() {
		it('number', function() {
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
		
		it('number', function() {
			var x = -4.4, y = 3.6, n = -1.3;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec2.x));
			assert.equal(true, glacier.compare(y - n, vec2.y));
		});
	});
	
	describe('uv', function() {
		it('', function() {
			var x = 8.4, y = -3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(x, vec2.u()));
			assert.equal(true, glacier.compare(y, vec2.v()));
		});
	});
});

describe('Vector3', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Vector3);
		assert.equal(true, new glacier.Vector3 instanceof glacier.Vector3);
	});
	
	describe('constructor', function() {
		it('default', function() {
			var vec3 = new glacier.Vector3();
			
			assert.equal(true, glacier.compare(0.0, vec3.x));
			assert.equal(true, glacier.compare(0.0, vec3.y));
			assert.equal(true, glacier.compare(0.0, vec3.z));
		});
		
		it('number, number, number', function() {
			var x = 1.5, y = 2.2, z = 3.9;
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
		
		it('number', function() {
			var x = 1.2, y = 2.5, z = 3.2, n = 4.9;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec3.x));
			assert.equal(true, glacier.compare(y + n, vec3.y));
			assert.equal(true, glacier.compare(z + n, vec3.z));
		});
	});
	
	describe('assign', function() {
		it('number, number, number', function() {
			var x1 = 1.5, y1 = 2.1, z1 = 3.7, x2 = 4.4, y2 = 5.2, z2 = 6.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.assign(x2, y2, z2);
			
			assert.equal(true, glacier.compare(x2, vec3.x));
			assert.equal(true, glacier.compare(y2, vec3.y));
			assert.equal(true, glacier.compare(z2, vec3.z));
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
		
		it('number', function() {
			var x = -6.2, y = 3.7, z = -8.4, n = 2.1;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec3.x));
			assert.equal(true, glacier.compare(y / n, vec3.y));
			assert.equal(true, glacier.compare(z / n, vec3.z));
		});
	});
	
	describe('dotProduct', function() {
		it('Vector3', function() {
			var x1 = 2.5, y1 = 4.3, z1 = -3.1, x2 = 6.0, y2 = -5.6, z2 = 8.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			var dot = vec3.dotProduct(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare((x1 * x2) + (y1 * y2) + (z1 * z2), dot));
		});
	});
	
	describe('length', function() {
		it('', function() {
			var x = 4.5, y = -3.4, z = 2.8;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)), vec3.length()));
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
		
		it('number', function() {
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
			var x = 5.0, y = -3.0, z = 2.0;
			var vec3 = new glacier.Vector3(x, y, z);
			var len = vec3.normalize().length();
			
			assert.equal(true, glacier.compare(len, 1.0));
		});
	});
	
	describe('rotateX', function() {
		it('number', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateX(n);
			
			assert.equal(true, glacier.compare(vec3.y, (y * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.z, (y * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateY', function() {
		it('number', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateY(n);
			
			assert.equal(true, glacier.compare(vec3.x, (x * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.z, (x * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateZ', function() {
		it('number', function() {
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
		
		it('number', function() {
			var x = -4.0, y = 3.0, z = 2.1, n = -1.8;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec3.x));
			assert.equal(true, glacier.compare(y - n, vec3.y));
			assert.equal(true, glacier.compare(z - n, vec3.z));
		});
	});
	
	describe('uvw', function() {
		it('', function() {
			var x = 8.4, y = -3.5, z = 5.2;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(x, vec3.u()));
			assert.equal(true, glacier.compare(y, vec3.v()));
			assert.equal(true, glacier.compare(z, vec3.w()));
		});
	});
});
