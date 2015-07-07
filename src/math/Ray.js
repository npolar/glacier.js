glacier.Ray = function Ray(origin, direction) {
	glacier.addTypedProperty(this, ['a', 'origin'], new glacier.Vector3(0.0), glacier.Vector3);
	glacier.addTypedProperty(this, ['b', 'direction'], new glacier.Vector3(0.0), glacier.Vector3);
	
	this.assign(origin, direction);
};

glacier.Ray.prototype = {
	get array() {
		return new Float32Array([ this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z ]);
	},
	
	assign: function(originOrRay, direction) {
		if(originOrRay instanceof glacier.Ray) {
			return this.assign(originOrRay.a, originOrRay.b);
		} else {
			var args = [ 'origin', 'direction' ];
			
			[ originOrRay, direction ].forEach(function(arg, index) {
				if(!(arg instanceof glacier.Vector3)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'Vector3', 'assign', 'Ray');
				}
			});
			
			this.a = originOrRay.copy;
			this.b = direction.copy;
		}
		
		return this;
	},
	
	boxIntersection: function(min, max) {
		if(!(min instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector3', 'boxIntersection', 'Ray');
		}
		
		if(!(max instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector3', 'boxIntersection', 'Ray');
		}
		
		var dir = new glacier.Vector3(1.0).divide(this.b),
			t1 = (min.x - this.a.x) * dir.x,
			t2 = (max.x - this.a.x) * dir.x,
			t3 = (min.y - this.a.y) * dir.y,
			t4 = (max.y - this.a.y) * dir.y,
			t5 = (min.z - this.a.z) * dir.z,
			t6 = (max.z - this.a.z) * dir.z,
			tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6)),
			tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));
			
		// Check if ray is behind, or avoids intersection
		if(tmax < 0 || tmin > tmax) {
			return null;
		}
		
		return this.b.copy.multiply(tmin).add(this.a);
	},
	
	deviation: function(ray) {
		if(ray instanceof glacier.Ray) {
			return this.b.dot(ray.b);
		}
		
		throw new glacier.exception.InvalidParameter('ray', ray, 'Ray', 'deviation', 'Ray');
	},
	
	distance: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			return this.b.copy.subtract(this.a).cross(this.a.copy.subtract(vec3)).length / this.b.copy.subtract(this.a).length;
		}
		
		throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'distance', 'Ray');
	},
	
	intersects: function(geometry) {
		if(geometry instanceof glacier.Sphere) {
			return this.sphereIntersection(geometry.matrix.translation, geometry.radius);
		} else if(geometry instanceof glacier.BoundingBox) {
			return this.boxIntersection(geometry.min, geometry.max);
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
