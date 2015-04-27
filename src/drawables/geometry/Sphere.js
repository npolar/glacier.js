glacier.Sphere = function Sphere(latitudes, longitudes, radius) {
	// Call super constructor
	glacier.Mesh.call(this);
	
	// Ensure that radius is a positive number
	radius = (typeof radius == 'number' && radius >= 0.0 ? radius : 0.0);
	
	// Define getter and setter for radius member
	Object.defineProperty(this, 'radius', {
		get: function() {
			return radius;
		},
		set: function(value) {
			if(typeof value == 'number' && value >= 0.0) {
				
				if(value > 0.0) {
					this.vertices.forEach(function(vertex) {
						vertex = (vertex / radius) * value;
					});
				} else if(this.indices.length) {
					this.free();
				}
				
				radius = value;
			} else {
				throw new glacier.exception.InvalidAssignment('radius', value, 'positive number', 'Sphere');
			}
		}
	});
	
	// Generate sphere is latitudes and longitudes are set
	if(latitudes && longitudes) {
		this.generate(latitudes, longitudes, radius || 1.0);
	}
};

glacier.extend(glacier.Sphere, glacier.Mesh, {
	// Overloaded members
	free: function() {
		glacier.Mesh.prototype.free.call(this);
		this.radius = 0.0;
	},
	
	// Unique members
	generate: function(latitudes, longitudes, radius) {
		// Validate latitudes parameter
		if(typeof latitudes != 'number' || latitudes < 3) {
			throw new glacier.exception.InvalidParameter('latitudes', latitudes, 'number (>= 3)', 'generate', 'Sphere');
		} else latitudes = Math.round(Math.abs(latitudes));
		
		// Validate longitudes parameter
		if(typeof longitudes != 'number' || longitudes < 3) {
			throw new glacier.exception.InvalidParameter('longitudes', longitudes, 'number (>= 3)', 'generate', 'Sphere');
		} else longitudes = Math.round(Math.abs(longitudes));
		
		// Validate radius parameter
		if(radius === undefined) {
			radius = 1.0;
		} else if(typeof radius != 'number' || radius <= 0.0) {
			throw new glacier.exception.InvalidParameter('radius', radius, 'number (> 0.0)', 'generate', 'Sphere');
		}
		
		this.free();
		this.radius = radius;
		
		var lat, lng, theta, sinTheta, cosTheta, phi, sinPhi, cosPhi, x, y, z, u, v;
		
		for(lat = 0; lat <= latitudes; ++lat) {
			theta = lat * Math.PI / latitudes;
			sinTheta = Math.sin(theta);
			cosTheta = Math.cos(theta);
			
			for(lng = 0; lng <= longitudes; ++lng) {
				phi = lng * 2 * Math.PI / longitudes;
				sinPhi = Math.sin(phi);
				cosPhi = Math.cos(phi);
				
				x = cosPhi * sinTheta;
				y = cosTheta;
				z = sinPhi * sinTheta;
				u = 1 - (lng / longitudes);
				v = (lat / latitudes);
				
				this.vertices.push(new glacier.Vector3(radius * x, radius * y, radius * z));
				this.normals.push(new glacier.Vector3(x, y, z));
				this.texCoords.push(new glacier.Vector2(u, v));
			}
		}
		
		for(lat = 0; lat < latitudes; ++lat) {
			for(lng = 0; lng < longitudes; ++lng) {
				x = (lat * (longitudes + 1)) + lng;
				y = x + longitudes + 1;
				
				this.indices.push(x, y, x + 1);
				this.indices.push(y, y + 1, x + 1);
			}
		}
		
		return true;
	}
});
