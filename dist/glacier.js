var glacier = {
	VERSION: "0.0.1",
	EPSILON: 10e-5
};

glacier.compare = function(number1, number2) {
	if(typeof number1 == 'number' && typeof number2 == 'number') {
		return (Math.abs(number1 - number2) < glacier.EPSILON);
	}
	
	return false;
};

if(typeof module == 'object') {
	module.exports = glacier;
}

glacier.colors = {
	WHITE:		0xFFFFFF,
	SILVER:		0xC0C0C0,
	GRAY:		0x808080,
	BLACK:		0x000000,
	RED:		0xFF0000,
	MAROON:		0x800000,
	YELLOW:		0xFFFF00,
	OLIVE:		0x808000,
	LIME:		0x00FF00,
	GREEN:		0x008000,
	AQUA:		0x00FFFF,
	TEAL:		0x008080,
	BLUE:		0x0000FF,
	NAVY:		0x000080,
	FUSCIA:		0xFF00FF,
	PURPLE:		0x800080
};

glacier.Matrix33 = function(value) {
	this.array = new Float32Array([
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0
	]);
	
	if(value) {
		this.assign(value);
	}
};

glacier.Matrix33.prototype = {
	assign: function(value) {
		var row, col, e;
		
		if(value instanceof glacier.Matrix33) {
			for(e in value.array) {
				this.array[e] = value.array[e];
			}
		} else if(value instanceof glacier.Matrix44) {
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					this.array[(col * 3) + row] = value.array[(col * 4) + row];
				}
			}
		} else if(value instanceof Array || value instanceof Float32Array) {
			for(e in value) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			console.warn('Invalid parameter type for glacier.Matrix33.assign: ' + typeof(value) + ' (expected Matrix33, Matrix44, array or number)');
		}
	},
	
	determinant: function() {
		return (this.array[0] * (this.array[4] * this.array[8] - this.array[5] * this.array[7]) -
				this.array[1] * (this.array[3] * this.array[8] - this.array[5] * this.array[6]) +
				this.array[2] * (this.array[3] * this.array[7] - this.array[4] * this.array[6]));
	},
	
	element: function(col, row) {
		return this.array[(col * 3) + row];
	},
	
	multiply: function(value) {
		var col, row, e, temp;
		
		if(value instanceof glacier.Matrix33) {
			temp = new Float32Array(9);
			
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					temp[(col * 3) + row] = ((this.array[(col * 3) + 0] * value.array[(0 * 3) + row]) +
											 (this.array[(col * 3) + 1] * value.array[(1 * 3) + row]) +
											 (this.array[(col * 3) + 2] * value.array[(2 * 3) + row]));
				}
			}
		} else if(value instanceof glacier.Matrix44) {
			temp = new glacier.Matrix33(value);
			this.multiply(temp);
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			console.warn('Invalid parameter type for glacier.Matrix33.multiply: ' + typeof(value) + ' (expected Matrix33, Matrix44 or number)');
		}
	},
	
	transpose: function() {
		var temp;
		
		temp = this.array[1];
		this.array[1] = this.array[3];
		this.array[3] = temp;
		
		temp = this.array[2];
		this.array[2] = this.array[6];
		this.array[6] = temp;
		
		temp = this.array[5];
		this.array[5] = this.array[7];
		this.array[7] = temp;
	},
	
	invert: function() {
		var temp = new Float32Array([
			this.array[4] * this.array[8] - this.array[5] * this.array[7],
			this.array[2] * this.array[7] - this.array[1] * this.array[8],
			this.array[1] * this.array[5] - this.array[2] * this.array[4],
			this.array[5] * this.array[6] - this.array[3] * this.array[8],
			this.array[0] * this.array[8] - this.array[2] * this.array[6],
			this.array[2] * this.array[3] - this.array[0] * this.array[5],
			this.array[3] * this.array[7] - this.array[4] * this.array[6],
			this.array[1] * this.array[6] - this.array[0] * this.array[7],
			this.array[0] * this.array[4] - this.array[1] * this.array[3]
		]);
		
		var det = (this.array[0] * temp[0] - this.array[1] * temp[3] + this.array[2] * temp[6]);
		
		if(Math.abs(det) < glacier.EPSILON)
			return false;
		
		det = 1.0 / det;
		
		for(var e in temp) {
			this.array[e] = (temp[e] * det);
		}
		
		return true;
	},
	
	toString: function() {
		return ('[[' + this.array[0] + ', ' + this.array[1] + ', ' + this.array[2] + '], ' +
				 '[' + this.array[3] + ', ' + this.array[4] + ', ' + this.array[5] + '], ' +
				 '[' + this.array[6] + ', ' + this.array[7] + ', ' + this.array[8] + ']]');
	}
};

glacier.Matrix44 = function(value) {
	this.array = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	
	if(value) {
		this.assign(value);
	}
};

glacier.Matrix44.prototype = {
	assign: function(value) {
		var row, col, e;
		
		if(value instanceof glacier.Matrix33) {
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					this.array[(col * 4) + row] = value.array[(col * 3) + row];
				}
			}
			
			this.array[ 3] = this.array[ 7] = this.array[11] = 0.0;
			this.array[12] = this.array[13] = this.array[14] = 0.0;
			this.array[16] = 1.0;
		} else if(value instanceof glacier.Matrix44) {
			for(e in value.array) {
				this.array[e] = value.array[e];
			}
		} else if(value instanceof Array || value instanceof Float32Array) {
			for(e in value) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			console.warn('Invalid parameter type for glacier.Matrix44.assign: ' + typeof(value) + ' (expected Matrix33, Matrix44, array or number)');
		}
	},
	
	determinant: function() {
		var a0 = this.array[ 0] * this.array[ 5] - this.array[ 1] * this.array[ 4];
		var a1 = this.array[ 0] * this.array[ 6] - this.array[ 2] * this.array[ 4];
		var a2 = this.array[ 0] * this.array[ 7] - this.array[ 3] * this.array[ 4];
		var a3 = this.array[ 1] * this.array[ 6] - this.array[ 2] * this.array[ 5];
		var a4 = this.array[ 1] * this.array[ 7] - this.array[ 3] * this.array[ 5];
		var a5 = this.array[ 2] * this.array[ 7] - this.array[ 3] * this.array[ 6];
		var b0 = this.array[ 8] * this.array[13] - this.array[ 9] * this.array[12];
		var b1 = this.array[ 8] * this.array[14] - this.array[10] * this.array[12];
		var b2 = this.array[ 8] * this.array[15] - this.array[11] * this.array[12];
		var b3 = this.array[ 9] * this.array[14] - this.array[11] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[10] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		return (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0); 
	},

	element: function(col, row) {
		return this.array[(col * 4) + row];
	},
	
	multiply: function() {
		var col, row, e, temp;
		
		if(value instanceof glacier.Matrix44) {
			temp = new Float32Array(16);
			
			for(col = 0; col < 4; ++col) {
				for(row = 0; row < 4; ++row) {
					temp[(col * 4) + row] = ((this.array[(col * 4) + 0] * value.array[(0 * 4) + row]) +
											 (this.array[(col * 4) + 1] * value.array[(1 * 4) + row]) +
											 (this.array[(col * 4) + 2] * value.array[(2 * 4) + row]) +
											 (this.array[(col * 4) + 3] * value.array[(3 * 4) + row]));
				}
			}
		} else if(value instanceof glacier.Matrix33) {
			temp = new glacier.Matrix44(value);
			this.multiply(temp);
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			console.warn('Invalid parameter type for glacier.Matrix4.multiply: ' + typeof(value) + ' (expected Matrix44, Matrix33 or number)');
		}
	},
	
	transpose: function() {
		var temp;
		
		temp = this.array[1];
		this.array[1] = this.array[4];
		this.array[4] = temp;
		
		temp = this.array[2];
		this.array[2] = this.array[8];
		this.array[8] = temp;
		
		temp = this.array[3];
		this.array[3] = this.array[12];
		this.array[12] = temp;
		
		temp = this.array[6];
		this.array[6] = this.array[9];
		this.array[9] = temp;
		
		temp = this.array[7];
		this.array[7] = this.array[13];
		this.array[13] = temp;
		
		temp = this.array[11];
		this.array[11] = this.array[14];
		this.array[14] = temp;
	},
	
	invert: function() {
		var a0 = this.array[ 0] * this.array[ 5] - this.array[ 1] * this.array[ 4];
		var a1 = this.array[ 0] * this.array[ 6] - this.array[ 2] * this.array[ 4];
		var a2 = this.array[ 0] * this.array[ 7] - this.array[ 3] * this.array[ 4];
		var a3 = this.array[ 1] * this.array[ 6] - this.array[ 2] * this.array[ 5];
		var a4 = this.array[ 1] * this.array[ 7] - this.array[ 3] * this.array[ 5];
		var a5 = this.array[ 2] * this.array[ 7] - this.array[ 3] * this.array[ 6];
		var b0 = this.array[ 8] * this.array[13] - this.array[ 9] * this.array[12];
		var b1 = this.array[ 8] * this.array[14] - this.array[10] * this.array[12];
		var b2 = this.array[ 8] * this.array[15] - this.array[11] * this.array[12];
		var b3 = this.array[ 9] * this.array[14] - this.array[11] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[10] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		var det = (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0); 
		
		if(Math.abs(det) < glacier.EPSILON)
			return false;
		
		this.array = new Float32Array([
			 this.array[ 5] * b5 - this.array[ 6] * b4 + this.array[ 7] * b3,
			-this.array[ 1] * b5 + this.array[ 2] * b4 - this.array[ 3] * b3,
			 this.array[13] * a5 - this.array[14] * a4 + this.array[15] * a3,
			-this.array[ 9] * a5 + this.array[10] * a4 - this.array[11] * a3,
			-this.array[ 4] * b5 + this.array[ 6] * b2 - this.array[ 7] * b1,
			 this.array[ 0] * b5 - this.array[ 2] * b2 + this.array[ 3] * b1,
			-this.array[12] * a5 + this.array[14] * a2 - this.array[15] * a1,
			 this.array[ 8] * a5 - this.array[10] * a2 + this.array[11] * a1,
			 this.array[ 4] * b4 - this.array[ 5] * b2 + this.array[ 7] * b0,
			-this.array[ 0] * b4 + this.array[ 1] * b2 - this.array[ 3] * b0,
			 this.array[12] * a4 - this.array[13] * a2 + this.array[15] * a0,
			-this.array[ 8] * a4 + this.array[ 9] * a2 - this.array[11] * a0,
			-this.array[ 4] * b3 + this.array[ 5] * b1 - this.array[ 6] * b0,
			 this.array[ 0] * b3 - this.array[ 1] * b1 + this.array[ 2] * b0,
			-this.array[12] * a3 + this.array[13] * a1 - this.array[14] * a0,
			 this.array[ 8] * a3 - this.array[ 9] * a1 + this.array[10] * a0 
		]);
		
		return true;
	},
	
	toString: function() {
		return ('[[' + this.array[ 0] + ', ' + this.array[ 1] + ', ' + this.array[ 2] + ', ' + this.array[ 3] + '], ' +
				 '[' + this.array[ 4] + ', ' + this.array[ 5] + ', ' + this.array[ 6] + ', ' + this.array[ 7] + '], ' +
				 '[' + this.array[ 8] + ', ' + this.array[ 9] + ', ' + this.array[10] + ', ' + this.array[11] + '], ' +
				 '[' + this.array[12] + ', ' + this.array[13] + ', ' + this.array[14] + ', ' + this.array[15] + ']]');
	}
};

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
		
		return this;
	},
	
	assign: function(x, y) {
		if(typeof x == 'number' && typeof y == 'number') {
			this.array[0] = x;
			this.array[1] = y;
		} else {
			console.warn('Invalid parameter types for glacier.Vector2.assign: ' + typeof(x) + ', ' + typeof(y) + ' (expected two numbers)');
		}
		
		return this;
	},

	distance: function(vec2) {
		var dx = this.array[0] - vec2.array[0], dy = this.array[1] - vec2.array[1];
		return Math.sqrt(dx * dx + dy * dy);
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector2) {
			this.array[0] /= value.array[0];
			this.array[1] /= value.array[1];
		} else if(typeof value == 'number') {
			this.array[0] /= value;
			this.array[1] /= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.divide: ' + typeof(value) + ' (expected number or Vector2)');
		}
		
		return this;
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
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.array[0] *= inverted;
		this.array[1] *= inverted;
		
		return this;
	},
	
	rotate: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.array[0] * cosRad) - (this.array[1] * sinRad));
		var rotY = ((this.array[0] * sinRad) + (this.array[1] * cosRad));
		
		this.array[0] = rotX;
		this.array[1] = rotY;
		
		return this;
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
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.array[0] + ', ' + this.array[1] + ')');
	},
	
	x: function() { return this.array[0]; },
	y: function() { return this.array[1]; },
	u: function() { return this.array[0]; },
	v: function() { return this.array[1]; }
};

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
		
		return this;
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
		
		return this;
	},
	
	crossProduct: function(vec3) {
		return new glacier.Vector3(
			(this.array[1] * vec3.array[2]) - (this.array[2] * vec3.array[1]),
			(this.array[2] * vec3.array[0]) - (this.array[0] * vec3.array[2]),
			(this.array[0] * vec3.array[1]) - (this.array[1] * vec3.array[0])
		);
	},
	
	distance: function(vec3) {
		var dx = this.array[0] - vec3.array[0], dy = this.array[1] - vec3.array[1], dz = this.array[2] - vec3.array[2];
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},
	
	divide: function(value) {
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
		
		return this;
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
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.array[0] *= inverted;
		this.array[1] *= inverted;
		this.array[2] *= inverted;
		
		return this;
	},
	
	rotateX: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotY = ((this.array[1] * cosRad) - (this.array[2] * sinRad));
		var rotZ = ((this.array[1] * sinRad) + (this.array[2] * cosRad));
		
		this.array[1] = rotY;
		this.array[2] = rotZ;
		
		return this;
	},
	
	rotateY: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.array[0] * cosRad) - (this.array[2] * sinRad));
		var rotZ = ((this.array[0] * sinRad) + (this.array[2] * cosRad));
		
		this.array[0] = rotX;
		this.array[2] = rotZ;
		
		return this;
	},
	
	rotateZ: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.array[0] * cosRad) - (this.array[1] * sinRad));
		var rotY = ((this.array[0] * sinRad) + (this.array[1] * cosRad));
		
		this.array[0] = rotX;
		this.array[1] = rotY;
		
		return this;
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
		
		return this;
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
