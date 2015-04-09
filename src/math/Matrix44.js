glacier.Matrix44 = function(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ]),
		writable: false
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33, Matrix44 or array[16]', method: 'Matrix44.assign' });
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
		
		glacier.error('INDEX_OUT_OF_RANGE', { index: (colOrIndex + (row || 0)), range: '0-16', method: 'Matrix44.element' });
		return undefined;
	},
	
	frustum: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(','), error, dX, dY, dZ, temp;
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.frustum' });
				error = true;
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(error || near <= 0.0 || far <= 0.0 || (dX = right - left) <= 0.0 || (dY = top - bottom) <= 0.0 || (dZ = far - near) <= 0.0) {
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
			glacier.error('MATRIX_NO_INVERSE', { matrix: temp.toString(), method: 'Matrix44.inverse' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33 or Matrix44', method: 'Matrix44.multiply' });
		}
		
		return this;
	},
	
	rotate: function(radians, xOrVec3, y, z) {
		// TODO
		return this;
	},
	
	scale: function(xOrVec3, y, z) {
		// TODO
		return this;
	},
	
	toString: function() {
		return ('[[' + this.array[ 0].toPrecision(5) + ', ' + this.array[ 1].toPrecision(5) + ', ' + this.array[ 2].toPrecision(5) + ', ' + this.array[ 3].toPrecision(5) + '], ' +
				 '[' + this.array[ 4].toPrecision(5) + ', ' + this.array[ 5].toPrecision(5) + ', ' + this.array[ 6].toPrecision(5) + ', ' + this.array[ 7].toPrecision(5) + '], ' +
				 '[' + this.array[ 8].toPrecision(5) + ', ' + this.array[ 9].toPrecision(5) + ', ' + this.array[10].toPrecision(5) + ', ' + this.array[11].toPrecision(5) + '], ' +
				 '[' + this.array[12].toPrecision(5) + ', ' + this.array[13].toPrecision(5) + ', ' + this.array[14].toPrecision(5) + ', ' + this.array[15].toPrecision(5) + ']]');
	},
	
	translate: function(xOrVec3, y, z) {
		// TODO
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
