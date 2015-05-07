glacier.Ray = function Ray(start, direction) {
	glacier.addTypedProperty(this, ['a', 'start'], (start instanceof glacier.Vector3 ? start : new glacier.Vector3(0.0)), glacier.Vector3);
	glacier.addTypedProperty(this, ['b', 'direction'], (direction instanceof glacier.Vector3 ? direction : new glacier.Vector3(0.0)), glacier.Vector3);
	
	if(start instanceof glacier.Ray) {
		this.assign(start);
	}
};

glacier.Ray.prototype = {
	get array() {
		return new Float32Array([ this.a, this.b ]);
	},
	
	assign: function(startOrRay, direction) {
		if(startOrRay instanceof glacier.Ray) {
			return this.assign(startOrRay.a, startOrRay.b);
		} else {
			var args = [ 'start', 'direction' ];
			
			[ startOrRay, direction ].forEach(function(arg, index) {
				if(!(arg instanceof glacier.Vector3)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'Vector3', 'assign', 'Ray');
				}
			});
			
			this.a = startOrRay;
			this.b = direction;
		}
		
		return this;
	},
	
	deviation: function(ray) {
		if(ray instanceof glacier.Ray) {
			return this.b.dot(ray.b);
		} else {
			throw new glacier.exception.InvalidParameter('ray', ray, 'Ray', 'deviation', 'Ray');
		}
	},
	
	toString: function() {
		return ('Ray(' + this.a.toString() + ' + ' + this.b.normalized.toString() + ')');
	}
};
