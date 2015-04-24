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
		if(vec3 instanceof glacier.Vector3) {
			if(!color || (color instanceof glacier.Color)) {
				this.colors.push(color || glacier.color.WHITE);
			} else {
				glacier.error('INVALID_PARAMETER', { parameter: 'color', value: typeof color, expected: 'Color', method: 'PointCollection.addPoint' });
				return false;
			}
			
			this.vertices.push(vec3);
			return true;
		}
		
		glacier.error('INVALID_PARAMETER', { parameter: 'vec3', value: typeof vec3, expected: 'Vector3', method: 'PointCollection.addPoint' });
		return false;
	},
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.vertices.length	= 0;
	}
});
