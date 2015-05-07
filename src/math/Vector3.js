glacier.Vector3 = function Vector3(xScalarOrVec3, y, z) {
	glacier.addTypedProperty(this, 'x', 0.0);
	glacier.addTypedProperty(this, 'y', 0.0);
	glacier.addTypedProperty(this, 'z', 0.0);
	
	if(xScalarOrVec3 !== undefined) {
		this.assign(xScalarOrVec3, y, z);
	}
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector3', 'add', 'Vector3');
		}
		
		return this;
	},
	
	angle: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			var angle = Math.acos(this.dot(vec3) / (this.length * vec3.length));
			return (isNaN(angle) ? 0.0 : angle);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'angle', 'Vector3');
		}
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z ]);
	},
	
	assign: function(xScalarOrVec3, y, z) {
		if(xScalarOrVec3 instanceof glacier.Vector3) {
			return this.assign(xScalarOrVec3.x, xScalarOrVec3.y, xScalarOrVec3.z);
		} else if(typeof xScalarOrVec3 == 'number' && y === undefined) {
			return this.assign(xScalarOrVec3, xScalarOrVec3, xScalarOrVec3);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xScalarOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(isNaN(arg)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector3');
				}
			});
			
			this.x = x;
			this.y = y;
			this.z = z;
		}
		
		return this;
	},
	
	cross: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			return new glacier.Vector3(
				(this.y * vec3.z) - (this.z * vec3.y),
				(this.z * vec3.x) - (this.x * vec3.z),
				(this.x * vec3.y) - (this.y * vec3.x)
			);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'cross', 'Vector3');
		}
	},
	
	distance: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			var dx = this.x - vec3.x, dy = this.y - vec3.y, dz = this.z - vec3.z;
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'distance', 'Vector3');
		}
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector3, Matrix33 or Matrix44', 'divide', 'Vector3');
		}
		
		return this;
	},
	
	dot: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			return ((this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z));
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'dot', 'Vector3');
		}
	},
	
	get length() {
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector3, Matrix33 or Matrix44', 'multiply', 'Vector3');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		
		return this;
	},
	
	get normalized() {
		return new glacier.Vector3(this).normalize();
	},
	
	rotateX: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotY = ((this.y * cosRad) - (this.z * sinRad));
			var rotZ = ((this.y * sinRad) + (this.z * cosRad));
			
			this.y = rotY;
			this.z = rotZ;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateX', 'Vector3');
		}
		
		return this;
	},
	
	rotateY: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.z * sinRad));
			var rotZ = ((this.x * sinRad) + (this.z * cosRad));
			
			this.x = rotX;
			this.z = rotZ;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateY', 'Vector3');
		}
		
		return this;
	},
	
	rotateZ: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.y * sinRad));
			var rotY = ((this.x * sinRad) + (this.y * cosRad));
			
			this.x = rotX;
			this.y = rotY;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateZ', 'Vector3');
		}
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector3', 'subtract', 'Vector3');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ')');
	}
};
