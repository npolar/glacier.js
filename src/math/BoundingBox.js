glacier.BoundingBox = function BoundingBox(minOrBoundingBox, max) {
	glacier.addTypedProperty(this, 'min', new glacier.Vector3( Number.MAX_VALUE), glacier.Vector3);
	glacier.addTypedProperty(this, 'max', new glacier.Vector3(-Number.MAX_VALUE), glacier.Vector3);
	
	if(minOrBoundingBox !== undefined && minOrBoundingBox !== null) {
		this.assign(minOrBoundingBox, max);
	}
};

glacier.BoundingBox.prototype = {
	add: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			this.min.add(vec3);
			this.max.add(vec3);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'add', 'BoundingBox');
		}
		
		return this;
	},
	
	assign: function(minOrBoundingBox, max) {
		if(minOrBoundingBox instanceof glacier.BoundingBox) {
			return this.assign(minOrBoundingBox.min, minOrBoundingBox.max);
		} else {
			var args = [ 'min', 'max' ], min = minOrBoundingBox;
			
			[ min, max ].forEach(function(arg, index) {
				if(!(arg instanceof glacier.Vector3)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'Vector3', 'assign', 'BoundingBox');
				}
			});
			
			this.min.assign(min);
			this.max.assign(max);
		}
		
		return this;
	},
	
	get copy() {
		return new glacier.BoundingBox(this);
	},
	
	get matrix() {
		var half = new glacier.Vector3(this.max).subtract(this.min).divide(2),
			matrix = new glacier.Matrix44();
			
		return matrix.translate(this.min.copy.add(half)).scale(half);
	},
	
	reset: function() {
		this.min.assign( Number.MAX_VALUE);
		this.max.assign(-Number.MAX_VALUE);
	},
	
	subtract: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			this.min.subtract(vec3);
			this.max.subtract(vec3);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'subtract', 'BoundingBox');
		}
		
		return this;
	},
	
	toString: function() {
		return ('BoundingBox(' + this.min.toString() + ', ' + this.max.toString() + ')');
	},
	
	update: function(min, max, matrix) {
		if(!(min instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector3', 'update', 'BoundingBox');
		}
		
		if(!(max instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector3', 'update', 'BoundingBox');
		}
		
		if(!(matrix instanceof glacier.Matrix44)) {
			matrix = new glacier.Matrix44();
		}
		
		this.reset();
		
		[
			[ max.x, max.y, max.z ], // rtf
			[ min.x, max.y, max.z ], // ltf
			[ max.x, max.y, min.z ], // rtb
			[ min.x, max.y, min.z ], // ltb
			[ max.x, min.y, max.z ], // rbf
			[ min.x, min.y, max.z ], // lbf
			[ max.x, min.y, min.z ], // rbb
			[ min.x, min.y, min.z ]  // lbb
		]
		.forEach(function(plane) {
			var vec3 = new glacier.Vector3(plane[0], plane[1], plane[2]).multiply(matrix);
			this.min.minimize(vec3);
			this.max.maximize(vec3);
		}, this);
	}
};
