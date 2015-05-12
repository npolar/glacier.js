glacier.Ray = function Ray(start, direction) {
	glacier.addTypedProperty(this, ['a', 'start'], new glacier.Vector3(0.0), glacier.Vector3);
	glacier.addTypedProperty(this, ['b', 'direction'], new glacier.Vector3(0.0), glacier.Vector3);
	
	this.assign(start, direction);
};

glacier.Ray.prototype = {
	get array() {
		return new Float32Array([ this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z ]);
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
			
			this.a = startOrRay.copy;
			this.b = direction.copy;
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
	
	intersects: function(geometry, viewMatrix) {
		if(geometry instanceof glacier.Sphere) {
			var center = new glacier.Vector3(geometry.x, geometry.y, geometry.z),
				radius = geometry.radius;
				
			if(viewMatrix instanceof glacier.Matrix44) {
				center.multiply(viewMatrix.inverse);
			}
			
			return this.sphereIntersection(center, radius);
		} else {
			console.warn('Ray.intersects currently only supports sphere intersections');
		}
		
		return null;
	},
	
	sphereIntersection: function(center, radius) {
		if(!(center instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('center', center, 'Vector3', 'sphereIntersection', 'Ray');
		}
		
		if(typeof radius != 'number') {
			throw new glacier.exception.InvalidParameter('radius', radius, 'number', 'sphereIntersection', 'Ray');
		}
		
		var o = this.a,
			p = this.b.copy.subtract(o),
			a = p.dot(p),
			b = (2 * p.x * (o.x - center.x)) + (2 * p.y * (o.y - center.y)) + (2 * p.z * (o.z - center.z)),
			c = (center.dot(center) + o.dot(o)) - (2 * center.dot(o)) - (radius * radius),
			d = (b * b) - (4 * a * c), t;
			
		if(d < 0) {
			return null;
		}
		
		t = (-b - Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
		return new glacier.Vector3(o.x + (t * p.x), o.y + (t * p.y), o.z + (t * p.z));
	},
	
	toString: function() {
		return ('Ray(' + this.a.toString() + ' + ' + this.b.normalized.toString() + ')');
	}
};
