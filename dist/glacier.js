var glacier = {
	VERSION: "0.0.1"
};

if(typeof module == 'object') {
	module.exports = glacier;
}

glacier.isArray = function(value) {
	return (value instanceof Array || value instanceof Float32Array);
};

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

glacier.EPSILON = 10e-5;

glacier.compare = function(value1, value2) {
	var e, val1Arr = glacier.isArray(value1), val2Arr = glacier.isArray(value2);
	
	if(val1Arr && val2Arr) {
		if(value1.length == value2.length) {
			for(e = 0; e < value1.length; ++e) {
				if(typeof value1[e] == 'number' && typeof value2[e] == 'number') {
					if(Math.abs(value1[e] - value2[e]) >= glacier.EPSILON) {
						return false;
					}
				} else if(value1 !== value2) {
					return false;
				}
			}
			
			return true;
		}
	} else if(val1Arr || val2Arr) {
		var arr = (val1Arr ? value1 : value2), val = (val1Arr ? value2 : value1);
		
		for(e = 0; e < value1.length; ++e) {
			if(typeof arr[e] == 'number' && typeof val == 'number') {
				if(Math.abs(arr[e] - val) >= glacier.EPSILON) {
					return false;
				}
			} else if(arr[e] !== val) {
				return false;
			}
		}
		
		return true;
	} else if(typeof value1 == 'number' && typeof value2 == 'number') {
		return (Math.abs(value1 - value2) < glacier.EPSILON);
	} else {
		return (value1 === value2);
	}
	
	return false;
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
		} else if(glacier.isArray(value)) {
			for(e = 0; e < value.length; ++e) {
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
	
	toArray: function() {
		return new Float32Array(this.array);
	},
	
	toString: function() {
		return ('[[' + this.array[0].toPrecision(5) + ', ' + this.array[1].toPrecision(5) + ', ' + this.array[2].toPrecision(5) + '], ' +
				 '[' + this.array[3].toPrecision(5) + ', ' + this.array[4].toPrecision(5) + ', ' + this.array[5].toPrecision(5) + '], ' +
				 '[' + this.array[6].toPrecision(5) + ', ' + this.array[7].toPrecision(5) + ', ' + this.array[8].toPrecision(5) + ']]');
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
			
		} else if(glacier.isArray(value)) {
			for(e = 0; e < value.length; ++e) {
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
	
	toArray: function() {
		return new Float32Array(this.array);
	},
	
	toString: function() {
		return ('[[' + this.array[ 0].toPrecision(5) + ', ' + this.array[ 1].toPrecision(5) + ', ' + this.array[ 2].toPrecision(5) + ', ' + this.array[ 3].toPrecision(5) + '], ' +
				 '[' + this.array[ 4].toPrecision(5) + ', ' + this.array[ 5].toPrecision(5) + ', ' + this.array[ 6].toPrecision(5) + ', ' + this.array[ 7].toPrecision(5) + '], ' +
				 '[' + this.array[ 8].toPrecision(5) + ', ' + this.array[ 9].toPrecision(5) + ', ' + this.array[10].toPrecision(5) + ', ' + this.array[11].toPrecision(5) + '], ' +
				 '[' + this.array[12].toPrecision(5) + ', ' + this.array[13].toPrecision(5) + ', ' + this.array[14].toPrecision(5) + ', ' + this.array[15].toPrecision(5) + ']]');
	}
};

glacier.Vector2 = function(x, y) {
	this.x = (typeof x == 'number' ? x : 0.0);
	this.y = (typeof y == 'number' ? y : 0.0);
};

glacier.Vector2.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x += value.x;
			this.y += value.y;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.add: ' + typeof(value) + ' (expected number or Vector2)');
		}
		
		return this;
	},
	
	assign: function(x, y) {
		if(typeof x == 'number' && typeof y == 'number') {
			this.x = x;
			this.y = y;
		} else {
			console.warn('Invalid parameter types for glacier.Vector2.assign: ' + typeof(x) + ', ' + typeof(y) + ' (expected two numbers)');
		}
		
		return this;
	},

	distance: function(vec2) {
		var dx = this.x - vec2.x, dy = this.y - vec2.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x /= value.x;
			this.y /= value.y;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.divide: ' + typeof(value) + ' (expected number or Vector2)');
		}
		
		return this;
	},
	
	dotProduct: function(vec2) {
		return ((this.x * vec2.x) + (this.y * vec2.y));
	},
	
	length: function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x *= value.x;
			this.y *= value.y;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.multiply: ' + typeof(value) + ' (expected number or Vector2)');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.x *= inverted;
		this.y *= inverted;
		
		return this;
	},
	
	rotate: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.y * sinRad));
		var rotY = ((this.x * sinRad) + (this.y * cosRad));
		
		this.x = rotX;
		this.y = rotY;
		
		return this;
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x -= value.x;
			this.y -= value.y;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector2.subtract: ' + typeof(value) + ' (expected number or Vector2)');
		}
		
		return this;
	},
	
	toArray: function() {
		return new Float32Array([
			this.x,
			this.y
		]);
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	},
	
	u: function() { return this.x; },
	v: function() { return this.y; }
};

glacier.Vector3 = function(x, y, z) {
	this.x = (typeof x == 'number' ? x : 0.0);
	this.y = (typeof y == 'number' ? y : 0.0);
	this.z = (typeof z == 'number' ? z : 0.0);
};

glacier.Vector3.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
			this.z += value;
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
			this.x = x;
			this.y = y;
			this.z = z;
		} else {
			console.warn('Invalid parameter types for glacier.Vector.assign: ' + typeof(x) + ', ' + typeof(y) + ', ' + typeof(z) + ' (expected three numbers)');
		}
		
		return this;
	},
	
	crossProduct: function(vec3) {
		return new glacier.Vector3(
			(this.y * vec3.z) - (this.z * vec3.y),
			(this.z * vec3.x) - (this.x * vec3.z),
			(this.x * vec3.y) - (this.y * vec3.x)
		);
	},
	
	distance: function(vec3) {
		var dx = this.x - vec3.x, dy = this.y - vec3.y, dz = this.z - vec3.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x /= value.x;
			this.y /= value.y;
			this.z /= value.z;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
			this.z /= value;
		} else if(value instanceof glacier.Matrix33) {
			this.x = (this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2));
			this.y = (this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2));
			this.z = (this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.x = (this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2)) + value.element(0, 3);
			this.y = (this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2)) + value.element(1, 3);
			this.z = (this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2)) + value.element(2, 3);
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.divide: ' + typeof(value) + ' (expected number, Vector3, Matrix33 or Matrix44)');
		}
		
		return this;
	},
	
	dotProduct: function(vec3) {
		return ((this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z));
	},
	
	length: function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x *= value.x;
			this.y *= value.y;
			this.z *= value.z;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
			this.z *= value;
		} else if(value instanceof glacier.Matrix33) {
			this.x = (this.x * value.element(0, 0)) + (this.y * value.element(0, 1)) + (this.z * value.element(0, 2));
			this.y = (this.x * value.element(1, 0)) + (this.y * value.element(1, 1)) + (this.z * value.element(1, 2));
			this.z = (this.x * value.element(2, 0)) + (this.y * value.element(2, 1)) + (this.z * value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.x = (this.x * value.element(0, 0)) + (this.y * value.element(0, 1)) + (this.z * value.element(0, 2)) + value.element(0, 3);
			this.y = (this.x * value.element(1, 0)) + (this.y * value.element(1, 1)) + (this.z * value.element(1, 2)) + value.element(1, 3);
			this.z = (this.x * value.element(2, 0)) + (this.y * value.element(2, 1)) + (this.z * value.element(2, 2)) + value.element(2, 3);
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.multiply: ' + typeof(value) + ' (expected number, Vector3, Matrix33 or Matrix44)');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		
		return this;
	},
	
	rotateX: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotY = ((this.y * cosRad) - (this.z * sinRad));
		var rotZ = ((this.y * sinRad) + (this.z * cosRad));
		
		this.y = rotY;
		this.z = rotZ;
		
		return this;
	},
	
	rotateY: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.z * sinRad));
		var rotZ = ((this.x * sinRad) + (this.z * cosRad));
		
		this.x = rotX;
		this.z = rotZ;
		
		return this;
	},
	
	rotateZ: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.y * sinRad));
		var rotY = ((this.x * sinRad) + (this.y * cosRad));
		
		this.x = rotX;
		this.y = rotY;
		
		return this;
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
			this.z -= value;
		} else {
			console.warn('Invalid parameter type for glacier.Vector3.subtract: ' + typeof(value) + ' (expected number or Vector3)');
		}
		
		return this;
	},
	
	toArray: function() {
		return new Float32Array([
			this.x,
			this.y,
			this.z
		]);
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ')');
	},
	
	u: function() { return this.x; },
	v: function() { return this.y; },
	w: function() { return this.z; }
};
