glacier.Mesh = function() {
	var arrays = {};
	
	'indices,normals,uvCoords,vertices'.split(',').forEach(function(property, index) {
		arrays[index] = [];
		
		Object.defineProperty(this, property, {
			get: function() {
				return arrays[index];
			},
			set: function(value) {
				if(glacier.isArray(value)) {
					arrays[index] = [];
					
					for(var i = 0; i < value.length; ++i) {
						arrays[index].push(value[i]);
					}
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Mesh.' + property, value: typeof value, expected: 'array' });
				}
			}
		});
	}, this);
};

glacier.Mesh.prototype = {
	generateSphere: function(latitudes, longitudes, radius) {
		var sphere = new glacier.Sphere(latitudes, longitudes, radius);
		
		if(sphere.radius) {
			this.indices = sphere.indices;
			this.normals = sphere.normals;
			this.uvCoords = sphere.uvCoords;
			this.vertices = sphere.vertices;
			return true;
		}
		
		return false;
	}
};
