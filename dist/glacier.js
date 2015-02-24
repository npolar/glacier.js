var glacier = {};

(function(glacier) {
	var lang;
	
	Object.defineProperties(glacier, {
		VERSION: {
			value: '0.0.2',
			writable: false
		},
		language: {
			get: function() { return lang; },
			set: function(language) {
				if(glacier.i18n[language]) {
					lang = language;
				} else {
					var fallback = (glacier.i18n.alias[language] ? glacier.i18n.alias[language][0] : null);
					lang = (glacier.i18n[fallback] ? fallback : 'en');
					
					glacier.error('UNDEFINED_LANGUAGE', { language: language, fallback: lang });
				}
			}
		}
	});
	
	glacier.error = function(message, params) {
		var msg = glacier.i18n(message), match;
		
		if(!msg) {
			msg = glacier.i18n('UNDEFINED_ERROR');
			params = { error: message };
		}
		
		if(typeof params == 'object' && (match = msg.match(/\{[^\}]*\}/g))) {
			for(var m in match) {
				var param = match[m].substr(1, match[m].length - 2);
				
				if(params.hasOwnProperty(param)) {
					msg = msg.replace(match[m], params[param]);
				}
			}
		}
		
		console.error(msg);
	};
	
	glacier.isArray = function(value) {
		return (value instanceof Array || value instanceof Float32Array);
	};
	
	glacier.union = function(members, value) {
		members = (members instanceof Array ? members : [ members ]);
		
		function addProperty(index) {
			Object.defineProperty(this, members[index], {
				get: function() { return value; },
				set: function(val) {
					if(typeof val == typeof value) {
						value = val;
					} else {
						glacier.error('INVALID_ASSIGNMENT', { value: typeof val, expected: typeof value });
					}
				}
			});
		}
		
		for(var m in members) {
			addProperty.call(this, m);
		}
	};
	
	if(typeof module == 'object') {
		module.exports = glacier;
	}
})(glacier);

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
	FUCHSIA:	0xFF00FF,
	PURPLE:		0x800080
};

glacier.i18n = function(code, language) {
	language = (language || glacier.language);
	
	if(glacier.i18n[language] && glacier.i18n[language][code]) {
		return glacier.i18n[language][code];
	} else if(glacier.i18n.alias[language]) {
		for(var a in glacier.i18n.alias[language]) {
			var alias = glacier.i18n.alias[language][a];
			
			if(glacier.i18n[alias] && glacier.i18n[alias][code]) {
				return glacier.i18n[alias][code];
			}
		}
	}
	
	// Use English (en) as secondary fallback
	return (glacier.i18n.en[code] || null);
};

// Primary fallback aliases
glacier.i18n.alias = {
	no: [ 'nb', 'nn' ],
	nb: [ 'nn' ],
	nn: [ 'nb' ]
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

glacier.Sphere = function(latitudes, longitudes, radius) {
	this.vertices	= [];
	this.indices	= [];
	this.normals	= [];
	this.uvCoords	= [];
	
	this.latitudes	= (typeof latitudes == 'number' ? Math.Max(Math.abs(latitudes), 3) : 6);
	this.longitudes	= (typeof longitudes == 'number' ? Math.Max(Math.abs(longitudes), 3) : 6);
	this.radius		= (typeof radius == 'number' ? Math.abs(this.radius) : 1.0);
	
	var lat, lng;
	
	for(lat = 0; lat <= this.latitudes; ++lat) {
		var theta = lat * (Math.PI / this.latitudes);
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		
		for(lng = 0; lng <= this.longitudes; ++lng) {
			var phi = lng * 2 * (Math.PI / this.latitudes);
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (lng / this.longitudes);
			var v = (lat / this.latitudes);
			
			this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
			this.normals.push(x, y, z);
			this.uvCoords.push(u, v);
		}
	}
	
	for(lat = 0; lat < this.latitudes; ++lat) {
		for(lng = 0; lng < this.longitudes; ++lng) {
			var i = (lat * (this.longitudes + 1)) + lng;
			var j = i + this.longitudes + 1;
			
			this.indices.push(i, j, i + 1);
			this.indices.push(j, j + 1, i + 1);
		}
	}
};

glacier.i18n.en = {
	INDEX_OUT_OF_RANGE:	'Index out of range: {index} (expected range {range}) in {method}',
	INVALID_ASSIGNMENT:	'Invalid assigment: {value} (expected {expected}) in {method}',
	INVALID_PARAMETER:	'Invalid parameter: {parameter} (expected {expected}) in {method}',
	MATRIX_NO_INVERSE:	'Inverse matrix does not exist: {matrix} in {method}',
	UNDEFINED_ERROR:	'Undefined error: {error}',
	UNDEFINED_LANGUAGE:	'Undefined language: {language} (using {fallback} as fallback)'
};

glacier.i18n.nb = {
	INDEX_OUT_OF_RANGE:	'Index out of range: {index} (expected range {range}) in {method}',
	INVALID_ASSIGNMENT:	'Ugyldig tildeing av verdi: {value} (forventet {expected}) i {method}',
	INVALID_PARAMETER:	'Ugyldig parameter: {parameter} (forventet {expected}) i {method}',
	MATRIX_NO_INVERSE:	'Invers matrise eksisterer ikke: {matrix} i {method}',
	UNDEFINED_ERROR:	'Udefinert feilmelding: {error}',
	UNDEFINED_LANGUAGE:	'Udefinert språkkode: {language} (bruker {fallback})'
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
			
		} else if(glacier.isArray(value) && value.length == 16) {
			for(e = 0; e < value.length; ++e) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Matrix33, Matrix44 or array[16]', method: 'Matrix44.assign' });
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
	
	multiply: function(value) {
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
			
			this.array = temp;
		} else if(value instanceof glacier.Matrix33) {
			temp = new glacier.Matrix44(value);
			this.multiply(temp);
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Matrix33 or Matrix44', method: 'Matrix44.multiply' });
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
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector2', method: 'Vector2.add' });
		}
		
		return this;
	},
	
	assign: function(x, y) {
		if(typeof x == 'number' && typeof y == 'number') {
			this.x = x;
			this.y = y;
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: typeof x + ', ' + typeof y, expected: 'numbers', method: 'Vector2.assign' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector2', method: 'Vector2.divide' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector2', method: 'Vector2.multiply' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector2', method: 'Vector2.subtract' });
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
	}
};

glacier.Vector3 = function(x, y, z) {
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	glacier.union.call(this, ['z', 'w'], (typeof z == 'number' ? z : 0.0));
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector3', method: 'Vector3.add' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof x + ', ' + typeof y + ', ' + typeof z, expected: 'numbers', method: 'Vector3.assign' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Vector3, Matrix33 or Matrix44', method: 'Vector3.divide' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number, Vector3, Matrix33 or Matrix44', method: 'Vector3.multiply' });
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
			glacier.error('INVALID_PARAMETER', { parameter: typeof value, expected: 'number or Vector3', method: 'Vector3.subtract' });
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
	}
};
