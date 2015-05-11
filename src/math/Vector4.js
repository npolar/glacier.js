glacier.Vector4 = function Vector4(x, y, z, w) {
	glacier.addTypedProperty(this, 'x', 0.0);
	glacier.addTypedProperty(this, 'y', 0.0);
	glacier.addTypedProperty(this, 'z', 0.0);
	glacier.addTypedProperty(this, 'w', 0.0);
	
	this.assign(x, y, z, w);
};

glacier.Vector4.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
			this.w += value.w;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
			this.z += value;
			this.w += value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector4', 'add', 'Vector4');
		}
		
		return this;
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z, this.w ]);
	},
	
	assign: function(x, y, z, w) {
		if(x !== null && x !== undefined) {
			if(x instanceof glacier.Vector4) {
				this.assign(x.x, x.y, x.z, x.w);
			} else if(x instanceof glacier.Vector3) {
				this.assign(x.x, x.y, x.z, (typeof y == 'number' ? y : 1.0));
			} else if(x instanceof glacier.Vector2) {
				this.assign(x.x, x.y, (typeof y == 'number' ? y : 0.0), (typeof z == 'number' ? z : 1.0));
			} else if(typeof x == 'number' && y === undefined) {
				this.assign(x, x, x, x);
			} else {
				var args = [ 'x', 'y', 'z', 'w' ];
				
				[ x, y, z, w ].forEach(function(arg, index) {
					if(isNaN(arg)) {
						throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector4');
					}
				});
				
				this.x = x;
				this.y = y;
				this.z = z;
				this.w = w;
			}
		}
		
		return this;
	},
	
	get copy() {
		return new glacier.Vector4(this);
	},

	divide: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x /= value.x;
			this.y /= value.y;
			this.z /= value.z;
			this.w /= value.w;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
			this.z /= value;
			this.w /= value;
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x / value.array[0]) + (this.y / value.array[4]) + (this.z / value.array[ 8]) + (this.w / value.array[12]),
				(this.x / value.array[1]) + (this.y / value.array[5]) + (this.z / value.array[ 9]) + (this.w / value.array[13]),
				(this.x / value.array[2]) + (this.y / value.array[6]) + (this.z / value.array[10]) + (this.w / value.array[14]),
				(this.x / value.array[3]) + (this.y / value.array[7]) + (this.z / value.array[11]) + (this.w / value.array[15])
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector4 or Matrix44', 'divide', 'Vector4');
		}
		
		return this;
	},
	
	dot: function(vec4) {
		if(vec4 instanceof glacier.Vector4) {
			return ((this.x * vec4.x) + (this.y * vec4.y) + (this.z * vec4.z) + (this.w * vec4.w));
		} else {
			throw new glacier.exception.InvalidParameter('vec4', vec4, 'Vector4', 'dot', 'Vector4');
		}
	},
	
	get length() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x *= value.x;
			this.y *= value.y;
			this.z *= value.z;
			this.w *= value.w;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
			this.z *= value;
			this.w *= value;
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x * value.array[0]) + (this.y * value.array[4]) + (this.z * value.array[ 8]) + (this.w * value.array[12]),
				(this.x * value.array[1]) + (this.y * value.array[5]) + (this.z * value.array[ 9]) + (this.w * value.array[13]),
				(this.x * value.array[2]) + (this.y * value.array[6]) + (this.z * value.array[10]) + (this.w * value.array[14]),
				(this.x * value.array[3]) + (this.y * value.array[7]) + (this.z * value.array[11]) + (this.w * value.array[15])
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector4 or Matrix44', 'multiply', 'Vector4');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		this.w *= inverted;
		
		return this;
	},
	
	get normalized() {
		return this.copy.normalize();
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
			this.w -= value.w;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
			this.z -= value;
			this.w -= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector4', 'subtract', 'Vector4');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')');
	},
	
	get xy() {
		return new glacier.Vector2(this.x, this.y);
	},
	
	get xyz() {
		return new glacier.Vector3(this.x, this.y, this.z);
	},
	
	get xyw() {
		return new glacier.Vector3(this.x, this.y, this.w);
	},
	
	get xz() {
		return new glacier.Vector2(this.x, this.z);
	},
	
	get xzw() {
		return new glacier.Vector3(this.x, this.z, this.w);
	},
	
	get xw() {
		return new glacier.Vector2(this.x, this.w);
	},
	
	get yz() {
		return new glacier.Vector2(this.y, this.z);
	},
	
	get yzw() {
		return new glacier.Vector3(this.y, this.z, this.w);
	},
	
	get yw() {
		return new glacier.Vector2(this.y, this.w);
	},
	
	get zw() {
		return new glacier.Vector2(this.z, this.w);
	}
};
