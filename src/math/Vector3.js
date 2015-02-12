glacier.Vector3 = function(x, y, z) {
	this.array = new Float32Array([
		(typeof x == 'number' ? x : 0.0),
		(typeof y == 'number' ? y : 0.0),
		(typeof z == 'number' ? z : 0.0)
	]);
};

glacier.Vector3.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector3) {
			this.array[0] += value.array[0];
			this.array[1] += value.array[1];
			this.array[2] += value.array[2];
		} else if(typeof value == 'number') {
			this.array[0] += value;
			this.array[1] += value;
			this.array[2] += value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.add: ' + typeof(value) + ' (expected number or Vector3)');
		}
	},
	
	angle: function(vec3) {
		var angle = Math.acos(this.dotProduct(vec3) / (this.length() * vec3.length()));
		return (isNaN(angle) ? 0.0 : angle);
	},
	
	assign: function(x, y, z) {
		if(typeof x == 'number' && typeof y == 'number' && typeof z == 'number') {
			this.array[0] = x;
			this.array[1] = y;
			this.array[2] = z;
		} else {
			console.warn('Invalid parameter types for glacier.Vector.assign: ' + typeof(x) + ', ' + typeof(y) + ', ' + typeof(z) + ' (expected three numbers)');
		}
	},
	
	crossProduct: function(vec3) {
		return new glacier.Vector3(
			(this.array[1] * vec3.array[2]) - (this.array[2] * vec3.array[1]),
			(this.array[2] * vec3.array[0]) - (this.array[0] * vec3.array[2]),
			(this.array[0] * vec3.array[1]) - (this.array[1] * vec3.array[0])
		);
	},
	
	distance: function(vec3) {
		return glacier.Vector3(this.array[0] - vec3.array[0], this.array[1] - vec3.array[1], this.array[2] - vec3.array[2]).length();
	},
	
	divide: function(vec3) {
		if(value instanceof glacier.Vector3) {
			this.array[0] /= value.array[0];
			this.array[1] /= value.array[1];
			this.array[2] /= value.array[2];
		} else if(typeof value == 'number') {
			this.array[0] /= value;
			this.array[1] /= value;
			this.array[2] /= value;
		} else if(value instanceof glacier.Matrix33) {
			this.array[0] = (this.array[0] / value.element(0, 0)) + (this.array[1] / value.element(0, 1)) + (this.array[2] / value.element(0, 2));
			this.array[1] = (this.array[0] / value.element(1, 0)) + (this.array[1] / value.element(1, 1)) + (this.array[2] / value.element(1, 2));
			this.array[2] = (this.array[0] / value.element(2, 0)) + (this.array[1] / value.element(2, 1)) + (this.array[2] / value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.array[0] = (this.array[0] / value.element(0, 0)) + (this.array[1] / value.element(0, 1)) + (this.array[2] / value.element(0, 2)) + value.element(0, 3);
			this.array[1] = (this.array[0] / value.element(1, 0)) + (this.array[1] / value.element(1, 1)) + (this.array[2] / value.element(1, 2)) + value.element(1, 3);
			this.array[2] = (this.array[0] / value.element(2, 0)) + (this.array[1] / value.element(2, 1)) + (this.array[2] / value.element(2, 2)) + value.element(2, 3);
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.divide: ' + typeof(value) + ' (expected number, Vector3, Matrix33 or Matrix44)');
		}
	},
	
	dotProduct: function(vec3) {
		return ((this.array[0] * vec3.array[0]) + (this.array[1] * vec3.array[1]) + (this.array[2] * vec3.array[2]));
	},
	
	length: function() {
		return Math.sqrt((this.array[0] * this.array[0]) + (this.array[1] * this.array[1]) + (this.array[2] * this.array[2]));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector3) {
			this.array[0] *= value.array[0];
			this.array[1] *= value.array[1];
			this.array[2] *= value.array[2];
		} else if(typeof value == 'number') {
			this.array[0] *= value;
			this.array[1] *= value;
			this.array[2] *= value;
		} else if(value instanceof glacier.Matrix33) {
			this.array[0] = (this.array[0] * value.element(0, 0)) + (this.array[1] * value.element(0, 1)) + (this.array[2] * value.element(0, 2));
			this.array[1] = (this.array[0] * value.element(1, 0)) + (this.array[1] * value.element(1, 1)) + (this.array[2] * value.element(1, 2));
			this.array[2] = (this.array[0] * value.element(2, 0)) + (this.array[1] * value.element(2, 1)) + (this.array[2] * value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.array[0] = (this.array[0] * value.element(0, 0)) + (this.array[1] * value.element(0, 1)) + (this.array[2] * value.element(0, 2)) + value.element(0, 3);
			this.array[1] = (this.array[0] * value.element(1, 0)) + (this.array[1] * value.element(1, 1)) + (this.array[2] * value.element(1, 2)) + value.element(1, 3);
			this.array[2] = (this.array[0] * value.element(2, 0)) + (this.array[1] * value.element(2, 1)) + (this.array[2] * value.element(2, 2)) + value.element(2, 3);
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.multiply: ' + typeof(value) + ' (expected number, Vector3, Matrix33 or Matrix44)');
		}
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.array[0] *= inverted;
		this.array[1] *= inverted;
		this.array[2] *= inverted;
	},
	
	rotateX: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		this.array[1] = ((this.array[1] * cosRad) - (this.array[2] * sinRad));
		this.array[2] = ((this.array[1] * sinRad) + (this.array[2] * cosRad));
	},
	
	rotateY: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		this.array[0] = ((this.array[0] * cosRad) - (this.array[2] * sinRad));
		this.array[2] = ((this.array[0] * sinRad) - (this.array[2] * cosRad));
	},
	
	rotateZ: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		this.array[0] = ((this.array[0] * cosRad) - (this.array[1] * sinRad));
		this.array[1] = ((this.array[0] * sinRad) + (this.array[1] * cosRad));
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector3) {
			this.array[0] -= value.array[0];
			this.array[1] -= value.array[1];
			this.array[2] -= value.array[2];
		} else if(typeof value == 'number') {
			this.array[0] -= value;
			this.array[1] -= value;
			this.array[2] -= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.subtract: ' + typeof(value) + ' (expected number or Vector3)');
		}
	},
	
	toString: function() {
		return ('(' + this.array[0] + ', ' + this.array[1] + ', ' + this.array[2] + ')');
	},
	
	x: function() { return this.array[0]; },
	y: function() { return this.array[1]; },
	z: function() { return this.array[2]; },
	u: function() { return this.array[0]; },
	v: function() { return this.array[1]; },
	w: function() { return this.array[2]; }
};
