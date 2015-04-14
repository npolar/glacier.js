glacier.Mesh = function(context) {
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

'indices,normals,uvCoords,vertices'.split(',').forEach(function(property, index) {
	var a, array = [];
	
	Object.defineProperty(glacier.Mesh.prototype, property, {
		get: function() {
			return array;
		},
		set: function(value) {
			if(glacier.isArray(value)) {
				for(a = 0; a < value.length; ++a) {
					array.push(value[a]);
				}
			} else {
				glacier.error('INVALID_ASSIGNMENT', { variable: 'Mesh.' + property, value: typeof value, expected: 'array' });
			}
		}
	});
});
