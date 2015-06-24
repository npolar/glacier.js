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
		
		// Calculate AABB
		self.aabb.reset();
		self.vertices.forEach(function(vertex) {
			self.aabb.min.minimize(vertex);
			self.aabb.max.maximize(vertex);
		});
		
		if(glacier.Drawable.prototype.init.call(this, context, options)) {
			// Initialize buffers
			if(self.buffers.solid.init(self.vertices, null, null, null, self.colors)) {
				self.buffers.solid.elements = self.vertices.length;
				self.buffers.solid.drawMode = context.gl.POINTS;
				return true;
			}
		}
		
		self.buffers.solid = null;
		return false;
	}
});
