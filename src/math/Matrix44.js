glacier.Matrix44 = function Matrix44(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ]),
	});
	
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
			
		} else if(glacier.isArray(value) && value.length == 16) {
			for(e = 0; e < value.length; ++e) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33, Matrix44 or array[16]', 'assign', 'Matrix44');
		}
		
		return this;
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
		var b3 = this.array[ 9] * this.array[14] - this.array[10] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[11] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		return (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
	},

	element: function(colOrIndex, row) {
		if(typeof row == 'number' && typeof colOrIndex == 'number') {
			if(row >= 0 && row <= 4 && colOrIndex >= 0 && colOrIndex <= 4) {
				return this.array[(colOrIndex * 4) + row];
			}
		} else if(typeof colOrIndex == 'number') {
			return this.array[colOrIndex];
		}
		
		throw new glacier.exception.IndexOutOfRange(colOrIndex + (row || 0), '0-16', 'element', 'Matrix44');
	},
	
	frustum: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(','), dX, dY, dZ;
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'frustum', 'Matrix44');
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(near <= 0.0 || far <= 0.0 || (dX = right - left) <= 0.0 || (dY = top - bottom) <= 0.0 || (dZ = far - near) <= 0.0) {
			return false;
		}
		
		this.assign(new glacier.Matrix44([
			2.0 * near / dX, 0.0, 0.0, 0.0,
			0.0, 2.0 * near / dY, 0.0, 0.0,
			(right + left) / dX, (top + bottom) / dY, -(near + far) / dZ, -1.0,
			0.0, 0.0, -2.0 * near * far / dZ, 0.0
		]).multiply(this));
		
		return true;
	},
	
	inverse: function() {
		var temp = new glacier.Matrix44(this);
		
		if(!temp.invert()) {
			console.warn('Inverse matrix does not exist: ' + temp.toString());
			return undefined;
		}
		
		return temp;
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
		var b3 = this.array[ 9] * this.array[14] - this.array[10] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[11] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		var det = (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
		
		if(glacier.compare(det, 0.0))
			return false;
		
		var temp = new Float32Array([
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
		
		det = 1.0 / det;
		
		for(var e = 0; e < temp.length; ++e) {
			this.array[e] = (temp[e] * det);
		}
		
		return true;
	},
	
	multiply: function(value) {
		var col, row, e, temp;
		
		if(value instanceof glacier.Matrix44) {
			temp = new Float32Array(this.array);
			
			for(col = 0; col < 4; ++col) {
				for(row = 0; row < 4; ++row) {
					this.array[(col * 4) + row] = ((temp[(col * 4) + 0] * value.array[(0 * 4) + row]) +
												   (temp[(col * 4) + 1] * value.array[(1 * 4) + row]) +
												   (temp[(col * 4) + 2] * value.array[(2 * 4) + row]) +
												   (temp[(col * 4) + 3] * value.array[(3 * 4) + row]));
				}
			}
		} else if(value instanceof glacier.Matrix33) {
			this.multiply(new glacier.Matrix44(value));
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33 or Matrix44', 'multiply', 'Matrix44');
		}
		
		return this;
	},
	
	ortho: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(',');
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'ortho', 'Matrix44');
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(!(dX = right - left) || !(dY = top - bottom) || !(dZ = far - near)) {
			return false;
		}
		
		this.assign(new glacier.Matrix44([
			2.0 / dX, 0.0, 0.0, 0.0,
			0.0, 2.0 / dY, 0.0, 0.0,
			0.0, 0.0, -2.0 / dZ, 0.0,
			-(right + left) / dX, -(top + bottom) / dY, -(near + far) / dZ, 1.0
		]).multiply(this));
		
		return true;
	},
	
	perspective: function(verticalViewAngle, aspectRatio, near, far) {
		var args = 'verticalViewAngle,aspectRatio,near,far'.split(','), height, width, temp = new glacier.Matrix44();
		
		[ verticalViewAngle, aspectRatio, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'perspective', 'Matrix44');
			}
		});
		
		if(near <= 0.0 || far <= 0.0) {
			return false;
		}
		
		height = Math.tan((verticalViewAngle / 360.0) * Math.PI) * near;
		width = height * aspectRatio;
		
		if(temp.frustum(-width, width, -height, height, near, far)) {
			this.assign(temp.multiply(this));
			return true;
		}
		
		return false;
	},
	
	rotate: function(radians, xOrVec3, y, z) {
		if(typeof radians != 'number') {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotate', 'Matrix44');
		} else if(xOrVec3 instanceof glacier.Vector3) {
			return this.rotate(radians, xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3, cosRad, sinRad, mag, oneMinusCos;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'rotate', 'Matrix44');
				}
			});
			
			oneMinusCos = 1.0 - (cosRad = Math.cos(radians));
			sinRad = Math.sin(radians);
			
			if(!isNaN((mag = Math.sqrt(x * x + y * y + z * z)))) {
				x /= mag;
				y /= mag;
				z /= mag;
				
				this.assign(new glacier.Matrix44([
					(oneMinusCos * (x * x)) + cosRad, (oneMinusCos * (x * y)) - (z * sinRad), (oneMinusCos * (x * z)) + (y * sinRad), 0.0,	// X rotation
					(oneMinusCos * (y * x)) + (z * sinRad), (oneMinusCos * (y * y)) + cosRad, (oneMinusCos * (y * z)) - (x * sinRad), 0.0,	// Y rotation
					(oneMinusCos * (z * x)) - (y * sinRad), (oneMinusCos * (z * y)) + (x * sinRad), (oneMinusCos * (z * z)) + cosRad, 0.0,	// Z rotation
					0.0, 0.0, 0.0, 1.0
				]).multiply(this));
			}
		}
		
		return this;
	},
	
	scale: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.scale(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'scale', 'Matrix44');
				}
			});
			
			this.array[ 0] *= x; this.array[ 4] *= y; this.array[ 8] *= z;
			this.array[ 1] *= x; this.array[ 5] *= y; this.array[ 9] *= z;
			this.array[ 2] *= x; this.array[ 6] *= y; this.array[10] *= z;
			this.array[ 3] *= x; this.array[ 7] *= y; this.array[11] *= z;
		}
		
		return this;
	},
	
	toString: function() {
		return ('[[' + this.array[ 0].toPrecision(5) + ', ' + this.array[ 1].toPrecision(5) + ', ' + this.array[ 2].toPrecision(5) + ', ' + this.array[ 3].toPrecision(5) + '], ' +
				 '[' + this.array[ 4].toPrecision(5) + ', ' + this.array[ 5].toPrecision(5) + ', ' + this.array[ 6].toPrecision(5) + ', ' + this.array[ 7].toPrecision(5) + '], ' +
				 '[' + this.array[ 8].toPrecision(5) + ', ' + this.array[ 9].toPrecision(5) + ', ' + this.array[10].toPrecision(5) + ', ' + this.array[11].toPrecision(5) + '], ' +
				 '[' + this.array[12].toPrecision(5) + ', ' + this.array[13].toPrecision(5) + ', ' + this.array[14].toPrecision(5) + ', ' + this.array[15].toPrecision(5) + ']]');
	},
	
	translate: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.translate(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'translate', 'Matrix44');
				}
			});
			
			this.array[12] += (this.array[ 0] * x + this.array[ 4] * y + this.array[ 8] * z);
			this.array[13] += (this.array[ 1] * x + this.array[ 5] * y + this.array[ 9] * z);
			this.array[14] += (this.array[ 2] * x + this.array[ 6] * y + this.array[10] * z);
			this.array[15] += (this.array[ 3] * x + this.array[ 7] * y + this.array[11] * z);
		}
		
		return this;
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
		
		return this;
	},
	
	transposed: function() {
		var temp = new glacier.Matrix44(this);
		return temp.transpose();
	}
};
