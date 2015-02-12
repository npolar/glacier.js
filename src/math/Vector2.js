glacier.Vector2 = function(x, y) {
	this.array = new Float32Array([
		(typeof x == 'number' ? x : 0.0),
		(typeof y == 'number' ? y : 0.0)
	]);
};

glacier.Vector2.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector2) {
			this.array[0] += value.array[0];
			this.array[1] += value.array[1];
		} else if(typeof value == 'number') {
			this.array[0] += value;
			this.array[1] += value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.add: ' + typeof(value) + ' (expected number or Vector2)');
		}
	},
	
	assign: function(x, y) {
		if(typeof x == 'number' && typeof y == 'number') {
			this.array[0] = x;
			this.array[1] = y;
		} else {
			console.warn('Invalid parameter types for glacier.Vector2.assign: ' + typeof(x) + ', ' + typeof(y) + ' (expected two numbers)');
		}
	},

	distance: function(vec2) {
		return glacier.Vector2(this.array[0] - vec2.array[0], this.array[1] - vec2.array[1]).length();
	},
	
	divide: function(vec2) {
		if(value instanceof glacier.Vector2) {
			this.array[0] /= value.array[0];
			this.array[1] /= value.array[1];
		} else if(typeof value == 'number') {
			this.array[0] /= value;
			this.array[1] /= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.divide: ' + typeof(value) + ' (expected number or Vector2)');
		}
	},
	
	
	dotProduct: function(vec2) {
		return ((this.array[0] * vec2.array[0]) + (this.array[1] * vec2.array[1]));
	},
	
	length: function() {
		return Math.sqrt((this.array[0] * this.array[0]) + (this.array[1] * this.array[1]));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector2) {
			this.array[0] *= value.array[0];
			this.array[1] *= value.array[1];
		} else if(typeof value == 'number') {
			this.array[0] *= value;
			this.array[1] *= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.multiply: ' + typeof(value) + ' (expected number or Vector2)');
		}
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.array[0] *= inverted;
		this.array[1] *= inverted;
	},
	
	rotate: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		this.array[0] = ((this.array[0] * cosRad) - (this.array[1] * sinRad));
		this.array[1] = ((this.array[0] * sinRad) + (this.array[1] * cosRad));
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector2) {
			this.array[0] -= value.array[0];
			this.array[1] -= value.array[1];
		} else if(typeof value == 'number') {
			this.array[0] -= value;
			this.array[1] -= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.subtract: ' + typeof(value) + ' (expected number or Vector2)');
		}
	},
	
	toString: function() {
		return ('(' + this.array[0] + ', ' + this.array[1] + ')');
	},
	
	x: function() { return this.array[0]; },
	y: function() { return this.array[1]; },
	u: function() { return this.array[0]; },
	v: function() { return this.array[1]; }
};
