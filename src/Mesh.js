glacier.Mesh = function(context) {
	if(context && !(context instanceof glacier.Context)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'context', value: typeof context, expected: 'Context', method: 'Mesh constructor' });
	} else {
		context = (context instanceof glacier.Context ? context : null);
	}
	
	Object.defineProperties(this, {
		context: {
			get: function() {
				return context;
			},
			set: function(value) {
				if(value instanceof glacier.Context) {
					context = value;
				} else if(context) {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Mesh.context', value: typeof value, expected: 'Context' });
				} else {
					context = null;
				}
			}
		},
		
		colors: 	{ value: new glacier.TypedArray('Color', glacier.Color) },
		indices:	{ value: new glacier.TypedArray('number') },
		normals:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) },
		texCoords:	{ value: new glacier.TypedArray('Vector2', glacier.Vector2) },
		vertices:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) }
	});
};

glacier.Mesh.prototype = {
	destroy: function() {
		this.colors.length		= 0;
		this.indices.length	 	= 0;
		this.normals.length		= 0;
		this.texCoords.length	= 0;
		this.vertices.length	= 0;
	},
	draw: function() {
		if(context) {
			context.draw(this);
		}
	}
};
