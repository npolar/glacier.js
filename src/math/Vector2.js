glacier.Vector2 = function Vector2(xScalarOrVec2, y) {
	glacier.addTypedProperty(this, [ 'x', 'u' ], 0.0);
	glacier.addTypedProperty(this, [ 'y', 'v' ], 0.0);
	
	if(xScalarOrVec2 !== undefined && xScalarOrVec2 !== null) {
		this.assign(xScalarOrVec2, y);
	}
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'add', 'Vector2');
		}
		
		return this;
	},
	
	get array() {
		return new Float32Array([ this.x, this.y ]);
	},
	
	assign: function(xScalarOrVec2, y) {
		if(xScalarOrVec2 instanceof glacier.Vector2) {
			return this.assign(xScalarOrVec2.x, xScalarOrVec2.y);
		} else if(typeof xScalarOrVec2 == 'number' && y === undefined) {
			return this.assign(xScalarOrVec2, xScalarOrVec2);
		} else {
			var args = [ 'x', 'y' ], x = xScalarOrVec2;
			
			[ x, y ].forEach(function(arg, index) {
				if(isNaN(arg)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector2');
				}
			});
			
			this.x = x;
			this.y = y;
		}
		
		return this;
	},

	distance: function(vec2) {
		if(vec2 instanceof glacier.Vector2) {
			var dx = this.x - vec2.x, dy = this.y - vec2.y;
			return Math.sqrt(dx * dx + dy * dy);
		} else {
			throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'distance', 'Vector2');
		}
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x /= value.x;
			this.y /= value.y;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'divide', 'Vector2');
		}
		
		return this;
	},
	
	dot: function(vec2) {
		if(vec2 instanceof glacier.Vector2) {
			return ((this.x * vec2.x) + (this.y * vec2.y));
		} else {
			throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'dot', 'Vector2');
		}
	},
	
	get length() {
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'multiply', 'Vector2');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		
		return this;
	},
	
	get normalized() {
		return new glacier.Vector2(this).normalize();
	},
	
	rotate: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.y * sinRad));
			var rotY = ((this.x * sinRad) + (this.y * cosRad));
			
			this.x = rotX;
			this.y = rotY;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotate', 'Vector2');
		}
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'subtract', 'Vector2');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	}
};
