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
		
		it('number (x), number (y), number (z)', function() {
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
		
		it('number (scalar)', function() {
			var x = 1.2, y = 2.5, z = 3.2, n = 4.9;
			var vec3 = new glacier.Vector3(x, y, z);
			
			vec3.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec3.x));
			assert.equal(true, glacier.compare(y + n, vec3.y));
			assert.equal(true, glacier.compare(z + n, vec3.z));
		});
	});
	
	describe('assign', function() {
		it('number (x), number (y), number (z)', function() {
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
		
		it('number (scalar)', function() {
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
			var x = 5.0, y = -3.0, z = 2.0;
			var vec3 = new glacier.Vector3(x, y, z);
			var len = vec3.normalize().length();
			
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
