glacier.PointCollection = function PointCollection() {
	// Call super constructor
	glacier.Drawable.call(this);
	
	// Define buffer arrays
	Object.defineProperties(this, {
		colors: 	{ value: new glacier.TypedArray('Color', glacier.Color) },
		vertices:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) }
	});
};

// glacier.PointCollection extends glacier.Drawable
glacier.extend(glacier.PointCollection, glacier.Drawable, {
	addPoint: function(vec3, color) {
		if(!(vec3 instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'addPoint', 'PointCollection');
		}
		
		if(!color || (color instanceof glacier.Color)) {
			this.colors.push(color || glacier.color.WHITE);
		} else {
			throw new glacier.exception.InvalidParameter('color', color, 'Color', 'addPoint', 'PointCollection');
		}
		
		this.vertices.push(vec3);
	},
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.vertices.length	= 0;
	},
	init: function(context, options) {
		var self = this;
		
		if(glacier.Drawable.prototype.init.call(this, context, options)) {
			if(self.buffer.init(self.vertices, null, null, null, self.colors)) {
				self.buffer.drawMode = context.gl.POINTS;
				self.buffer.elements = self.vertices.length;
				
				self.aabb.reset();
				
				self.vertices.forEach(function(vertex) {
					self.aabb.min.minimize(vertex);
					self.aabb.max.maximize(vertex);
				});
				
				return true;
			}
		}
		
		self.buffer = null;
		return false;
	},
	addGeoJSON: function(geoJsonURL, onSuccess, color) {
		var self = this;
		
		glacier.load(geoJsonURL, function(geojson) {
			function latLngToVec3(lat, lng, radius) {
				var theta = glacier.degToRad(lng), phi = glacier.degToRad(lat);
				
				return new glacier.Vector3(
					-radius * Math.cos(phi) * Math.cos(theta),
					 radius * Math.sin(phi),
					 radius * Math.cos(phi) * Math.sin(theta)
				);
			}
			
			function addObject(object) {
				if(object instanceof glacier.geoJSON.Point) {
					self.addPoint(latLngToVec3(object.lat, object.lng, 1.0), color || glacier.color.WHITE);
				} else if(object instanceof glacier.geoJSON.MultiPoint) {
					object.points.forEach(function(point) {
						self.addPoint(latLngToVec3(point.lat, point.lng, 1.0), color || glacier.color.WHITE);
					});
				} else if(object instanceof glacier.geoJSON.Feature) {
					addObject(object.geometry);
				} else if(object instanceof Array) {
					geojson.forEach(function(element) {
						addObject(element);
					});
				}
			}
			
			if((geojson = glacier.geoJSON.parse(geojson))) {
				addObject(geojson);
				
				if(typeof onSuccess == 'function') {
					onSuccess();
				}
			}
			
			// Point, MultiPoint, GeometryCollection, Feature, FeatureCollection
		});
	}
});
