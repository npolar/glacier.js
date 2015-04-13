glacier.Sphere = function(latitudes, longitudes, radius) {
	radius = (typeof radius == 'number' && radius >= 0.0 ? radius : 0.0);
	
	Object.defineProperties(this, {
		indices: {
			value: [],
			writable: false
		},
		normals: {
			value: [],
			writable: false
		},
		radius: {
			get: function() {
				return radius;
			},
			set: function(value) {
				if(typeof value == 'number' && value >= 0.0) {
					
					if(value > 0.0) {
						this.vertices.forEach(function(vertex) {
							vertex = (vertex / radius) * value;
						});
					} if(this.indices.length) {
						this.destroy();
					}
					
					radius = value;
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Sphere.radius', value: value, expected: 'positive number' });
				}
			}
		},
		uvCoords: {
			value: [],
			writable: false
		},
		vertices: {
			value: [],
			writable: false
		}
	});
	
	if(latitudes && longitudes) {
		this.generate(latitudes, longitudes, radius || 1.0);
	}
};

glacier.Sphere.prototype = {
	destroy: function() {
		this.indices.length = 0;
		this.normals.length = 0;
		this.uvCoords.length = 0;
		this.vertices.length = 0;
		this.radius = 0.0;
	},
	generate: function(latitudes, longitudes, radius) {
		// Validate latitudes parameter
		if(typeof latitudes != 'number' || latitudes < 3) {
			glacier.error('INVALID_PARAMETER', { parameter: 'latitudes', value: latitudes, expected: 'number (>= 3)', method: 'Sphere.generate' });
			return false;
		} else latitudes = Math.round(Math.abs(latitudes));
		
		// Validate longitudes parameter
		if(typeof longitudes != 'number' || longitudes < 3) {
			glacier.error('INVALID_PARAMETER', { parameter: 'longitudes', value: longitudes, expected: 'number (>= 3)', method: 'Sphere.generate' });
			return false;
		} else longitudes = Math.round(Math.abs(longitudes));
		
		// Validate radius parameter
		if(radius === undefined) {
			radius = 1.0;
		} else if(typeof radius != 'number' || radius <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'radius', value: radius, expected: 'number (> 0.0)', method: 'Sphere.generate' });
			return false;
		}
		
		this.destroy();
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
				u = (lng / longitudes);
				v = (lat / latitudes);
				
				this.vertices.push(radius * x, radius * y, radius * z);
				this.normals.push(x, y, z);
				this.uvCoords.push(u, v);
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
};
