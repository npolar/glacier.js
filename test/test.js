var assert = require('assert');
var glacier = require('../dist/glacier.min.js');

describe('Vector2', function() {
	it('class in glacier', function() {
		assert.equal('object', typeof glacier);
		assert.equal('function', typeof glacier.Vector2);
		assert.equal(true, new glacier.Vector2 instanceof glacier.Vector2);
	});
	
	describe('constructor', function() {
		it('default', function() {
			var vec2 = new glacier.Vector2();
			
			assert.equal(true, glacier.compare(0.0, vec2.array[0]));
			assert.equal(true, glacier.compare(0.0, vec2.array[1]));
		});
		
		it('number, number', function() {
			var x = 1.6, y = 2.2;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(x, vec2.array[0]));
			assert.equal(true, glacier.compare(y, vec2.array[1]));
		});
	});
	
	describe('add', function() {
		it('Vector2', function() {
			var x1 = 1.1, y1 = 2.5, x2 = 3.0, y2 = 4.4;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.add(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 + x2, vec2.array[0]));
			assert.equal(true, glacier.compare(y1 + y2, vec2.array[1]));
		});
		
		it('number', function() {
			var x = 1.2, y = 2.6, n = 3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec2.array[0]));
			assert.equal(true, glacier.compare(y + n, vec2.array[1]));
		});
	});
	
	describe('assign', function() {
		it('number, number', function() {
			var x1 = 1.5, y1 = 2.4, x2 = 3.7, y2 = 4.4;
			var vec2 = new glacier.Vector2(x1, x2);
			
			vec2.assign(x2, y2);
			
			assert.equal(true, glacier.compare(x2, vec2.array[0]));
			assert.equal(true, glacier.compare(y2, vec2.array[1]));
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
			
			assert.equal(true, glacier.compare(x1 / x2, vec2.array[0]));
			assert.equal(true, glacier.compare(y1 / y2, vec2.array[1]));
		});
		
		it('number', function() {
			var x = -6.7, y = 3.2, n = 4.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec2.array[0]));
			assert.equal(true, glacier.compare(y / n, vec2.array[1]));
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
			
			assert.equal(true, glacier.compare(x1 * x2, vec2.array[0]));
			assert.equal(true, glacier.compare(y1 * y2, vec2.array[1]));
		});
		
		it('number', function() {
			var x = 4.9, y = -3.7, n = 5.1;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.multiply(n);
			
			assert.equal(true, glacier.compare(x * n, vec2.array[0]));
			assert.equal(true, glacier.compare(y * n, vec2.array[1]));
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
			
			assert.equal(true, glacier.compare(vec2.array[0], (x * Math.cos(n)) - (y * Math.sin(n))));
			assert.equal(true, glacier.compare(vec2.array[1], (x * Math.sin(n)) + (y * Math.cos(n))));
		});
	});
	
	describe('subtract', function() {
		it('Vector2', function() {
			var x1 = 3.5, y1 = 1.7, x2 = -4.3, y2 = -2.7;
			var vec2 = new glacier.Vector2(x1, y1);
			
			vec2.subtract(new glacier.Vector2(x2, y2));
			
			assert.equal(true, glacier.compare(x1 - x2, vec2.array[0]));
			assert.equal(true, glacier.compare(y1 - y2, vec2.array[1]));
		});
		
		it('number', function() {
			var x = -4.4, y = 3.6, n = -1.3;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec2.array[0]));
			assert.equal(true, glacier.compare(y - n, vec2.array[1]));
		});
	});
	
	describe('xy/uv', function() {
		it('', function() {
			var x = 8.4, y = -3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			assert.equal(true, glacier.compare(x, vec2.x()));
			assert.equal(true, glacier.compare(y, vec2.y()));
			
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
			
			assert.equal(true, glacier.compare(0.0, vec3.array[0]));
			assert.equal(true, glacier.compare(0.0, vec3.array[1]));
			assert.equal(true, glacier.compare(0.0, vec3.array[2]));
		});
		
		it('number, number, number', function() {
			var x = 1.5, y = 2.2, z = 3.9;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(x, vec3.array[0]));
			assert.equal(true, glacier.compare(y, vec3.array[1]));
			assert.equal(true, glacier.compare(z, vec3.array[2]));
		});
	});
	
	describe('add', function() {
		it('Vector3', function() {
			var x1 = 1.0, y1 = 2.2, z1 = 3.7, x2 = 4.0, y2 = 5.2, z2 = 6.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.add(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 + x2, vec3.array[0]));
			assert.equal(true, glacier.compare(y1 + y2, vec3.array[1]));
			assert.equal(true, glacier.compare(z1 + z2, vec3.array[2]));
		});
		
		it('number', function() {
			var x = 1.2, y = 2.5, z = 3.2, n = 4.9;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec3.array[0]));
			assert.equal(true, glacier.compare(y + n, vec3.array[1]));
			assert.equal(true, glacier.compare(z + n, vec3.array[2]));
		});
	});
	
	describe('assign', function() {
		it('number, number, number', function() {
			var x1 = 1.5, y1 = 2.1, z1 = 3.7, x2 = 4.4, y2 = 5.2, z2 = 6.9;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.assign(x2, y2, z2);
			
			assert.equal(true, glacier.compare(x2, vec3.array[0]));
			assert.equal(true, glacier.compare(y2, vec3.array[1]));
			assert.equal(true, glacier.compare(z2, vec3.array[2]));
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
			
			assert.equal(true, glacier.compare(x1 / x2, vec3.array[0]));
			assert.equal(true, glacier.compare(y1 / y2, vec3.array[1]));
			assert.equal(true, glacier.compare(z1 / z2, vec3.array[2]));
		});
		
		it('number', function() {
			var x = -6.2, y = 3.7, z = -8.4, n = 2.1;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.divide(n);
			
			assert.equal(true, glacier.compare(x / n, vec3.array[0]));
			assert.equal(true, glacier.compare(y / n, vec3.array[1]));
			assert.equal(true, glacier.compare(z / n, vec3.array[2]));
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
			
			assert.equal(true, glacier.compare(x1 * x2, vec3.array[0]));
			assert.equal(true, glacier.compare(y1 * y2, vec3.array[1]));
			assert.equal(true, glacier.compare(z1 * z2, vec3.array[2]));
		});
		
		it('number', function() {
			var x = 4.6, y = -3.1, z = 6.8, n = 5.2;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.multiply(n);
			
			assert.equal(true, glacier.compare(x * n, vec3.array[0]));
			assert.equal(true, glacier.compare(y * n, vec3.array[1]));
			assert.equal(true, glacier.compare(z * n, vec3.array[2]));
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
			
			assert.equal(true, glacier.compare(vec3.array[1], (y * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.array[2], (y * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateY', function() {
		it('number', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateY(n);
			
			assert.equal(true, glacier.compare(vec3.array[0], (x * Math.cos(n)) - (z * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.array[2], (x * Math.sin(n)) + (z * Math.cos(n))));
		});
	});
	
	describe('rotateZ', function() {
		it('number', function() {
			var x = -4.0, y = 2.0, z = 6.0, n = 0.7;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.rotateZ(n);
			
			assert.equal(true, glacier.compare(vec3.array[0], (x * Math.cos(n)) - (y * Math.sin(n))));
			assert.equal(true, glacier.compare(vec3.array[1], (x * Math.sin(n)) + (y * Math.cos(n))));
		});
	});
	
	describe('subtract', function() {
		it('Vector3', function() {
			var x1 = 3.2, y1 = 1.0, z1 = -6.0, x2 = -4.4, y2 = -2.0, z2 = 2.0;
			var vec3 = new glacier.Vector3(x1, y1, z1);
			
			vec3.subtract(new glacier.Vector3(x2, y2, z2));
			
			assert.equal(true, glacier.compare(x1 - x2, vec3.array[0]));
			assert.equal(true, glacier.compare(y1 - y2, vec3.array[1]));
			assert.equal(true, glacier.compare(z1 - z2, vec3.array[2]));
		});
		
		it('number', function() {
			var x = -4.0, y = 3.0, z = 2.1, n = -1.8;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.subtract(n);
			
			assert.equal(true, glacier.compare(x - n, vec3.array[0]));
			assert.equal(true, glacier.compare(y - n, vec3.array[1]));
			assert.equal(true, glacier.compare(z - n, vec3.array[2]));
		});
	});
	
	describe('xyz/uvw', function() {
		it('', function() {
			var x = 8.4, y = -3.5, z = 5.2;
			var vec3 = new glacier.Vector3(x, y, z);
			
			assert.equal(true, glacier.compare(x, vec3.x()));
			assert.equal(true, glacier.compare(y, vec3.y()));
			assert.equal(true, glacier.compare(z, vec3.z()));
			
			assert.equal(true, glacier.compare(x, vec3.u()));
			assert.equal(true, glacier.compare(y, vec3.v()));
			assert.equal(true, glacier.compare(z, vec3.w()));
		});
	});
});
