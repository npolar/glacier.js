glacier.Vector2 = function Vector2(x, y) {
	glacier.addTypedProperty(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.addTypedProperty(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	
	if(x instanceof glacier.Vector2) {
		this.assign(x);
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
	
	assign: function(xOrVec2, y) {
		if(xOrVec2 instanceof glacier.Vector2) {
			return this.assign(xOrVec2.x, xOrVec2.y);
		} else {
			var args = [ 'x', 'y' ], x = xOrVec2;
			
			[ x, y ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector2');
				}
			});
			
			this.x = x;
			this.y = y;
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'divide', 'Vector2');
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'multiply', 'Vector2');
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'subtract', 'Vector2');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	},
	
	get array() {
		return new Float32Array([ this.x, this.y ]);
	}
};
