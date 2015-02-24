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
		} else if(glacier.isArray(value) && value.length == 9) {
			for(e = 0; e < value.length; ++e) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Matrix33, Matrix44 or array[9]', method: 'Matrix33.assign' });
		}
		
		return this;
	},
	
	determinant: function() {
		return (this.array[0] * (this.array[4] * this.array[8] - this.array[5] * this.array[7]) -
				this.array[1] * (this.array[3] * this.array[8] - this.array[5] * this.array[6]) +
				this.array[2] * (this.array[3] * this.array[7] - this.array[4] * this.array[6]));
	},
	
	element: function(colOrIndex, row) {
		if(typeof row == 'number' && typeof colOrIndex == 'number') {
			if(row >= 0 && row <= 3 && colOrIndex >= 0 && colOrIndex <= 3) {
				return this.array[(colOrIndex * 3) + row];
			}
		} else if(typeof colOrIndex == 'number') {
			return this.array[colOrIndex];
		}
		
		glacier.error('INDEX_OUT_OF_RANGE', { index: (colOrIndex + (row || 0)), range: '0-9', method: 'Matrix33.element' });
		return undefined;
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
			
			this.array = temp;
		} else if(value instanceof glacier.Matrix44) {
			temp = new glacier.Matrix33(value);
			this.multiply(temp);
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Matrix33 or Matrix44', method: 'Matrix33.multiply' });
		}
		
		return this;
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
		
		return this;
	},
	
	transposed: function() {
		var temp = new glacier.Matrix33(this);
		return temp.transpose();
	},
	
	inverse: function() {
		var temp = new glacier.Matrix33(this);
		
		if(!temp.invert()) {
			glacier.error('MATRIX_NO_INVERSE', { matrix: temp.toString(), method: 'Matrix33.inverse' });
			return undefined;
		}
		
		return temp;
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
		
		var det = (this.array[0] * temp[0] + this.array[1] * temp[3] + this.array[2] * temp[6]);
		
		if(glacier.compare(det, 0.0))
			return false;
		
		det = 1.0 / det;
		
		for(var e = 0; e < temp.length; ++e) {
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
