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
		
		it('number (x), number (y)', function() {
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
		
		it('number (scalar)', function() {
			var x = 1.2, y = 2.6, n = 3.5;
			var vec2 = new glacier.Vector2(x, y);
			
			vec2.add(n);
			
			assert.equal(true, glacier.compare(x + n, vec2.x));
			assert.equal(true, glacier.compare(y + n, vec2.y));
		});
	});
	
	describe('assign', function() {
		it('number (x), number (y)', function() {
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
			var x = 5.5, y = -3.8;
			var len = new glacier.Vector2(x, y).normalized.length;
			
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
