glacier.Mesh = function Mesh() {
	// Call super constructor
	glacier.Drawable.call(this);

	// Define buffer arrays
	Object.defineProperties(this, {
		colors: 	{ value: new glacier.TypedArray('Color', glacier.Color) },
		indices:	{ value: new glacier.TypedArray('number') },
		normals:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) },
		texCoords:	{ value: new glacier.TypedArray('Vector2', glacier.Vector2) },
		vertices:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) }
	});
	
	// Define texture properties
	[ 0, 1, 2, 3 ].forEach(function(number) {
		var tex = new glacier.Texture(), property = 'texture' + number;
		
		Object.defineProperty(this, property, {
			get: function() {
				return tex;
			},
			set: function(value) {
				if(typeof value == 'string') {
					tex.load(value);
				} else if(value === null) {
					tex.free();
				} else {
					throw new glacier.exception.InvalidAssignment(property, typeof value, 'string or null', 'Mesh');
				}
			}
		});
	}, this);
};

// glacier.Mesh extends glacier.Drawable
glacier.extend(glacier.Mesh, glacier.Drawable, {
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.indices.length	 	= 0;
		this.normals.length		= 0;
		this.texCoords.length	= 0;
		this.vertices.length	= 0;
	}
});
