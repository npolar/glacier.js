glacier.Drawable = function Drawable() {
	// Define aabb, matrix and visible members
	glacier.addTypedProperty(this, 'aabb', new glacier.BoundingBox(), glacier.BoundingBox);
	glacier.addTypedProperty(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'visible', true);
	
	// Define getters/setters for x, y and z members
	[ 'x', 'y', 'z' ].forEach(function(property, index) {
		Object.defineProperty(this, property, {
			get: function() {
				return this.matrix.array[12 + index];
			},
			set: function(value) {
				if(typeof value == 'number') {
					this.matrix.array[12 + index] = value;
				} else {
					glacier.error.invalidAssignment(property, value, 'number', 'Drawable');
				}
			}
		});
	}, this);
	
	var drawMode = glacier.draw.SOLID;
	
	// Define buffers and drawMode members
	Object.defineProperties(this, {
		buffers: {
			value: {
				solid:		null,
				wireframe:	null,
				bounding:	null,
				normals:	null
			}
		},
		drawMode: {
			get: function() {
				return drawMode;
			},
			set: function(mode) {
				if(typeof mode == 'number' && mode >= 0) {
					drawMode = mode;
				} else {
					glacier.error.invalidAssignment('drawMode', mode, 'number >= 0', 'Drawable');
				}
			}
		}
	});
};

glacier.draw = {
	SOLID:		0x01,
	WIREFRAME:	0x02,
	BOUNDING:	0x04,
	NORMALS:	0x08
};

glacier.Drawable.prototype = {
	free: function() {
		for(var b in this.buffers) {
			if(this.buffers.hasOwnProperty(b)) {
				if(this.buffers[b] instanceof glacier.BufferObject) {
					this.buffers[b].free();
					this.buffers[b] = null;
				}
			}
		}
		
		this.matrix		= new glacier.Matrix44();
		this.visible	= true;
	},
	draw: function() {
		if(this.visible && this.drawMode) {
			var d, bufferObj;
			
			for(d in glacier.draw) {
				if(glacier.draw.hasOwnProperty(d) && (this.drawMode & glacier.draw[d])) {
					if((bufferObj = this.buffers[d.toLowerCase()]) instanceof glacier.BufferObject) {
						bufferObj.draw();
					}
				}
			}
		}
	},
	init: function(context, options) {
		if(!(context instanceof glacier.Context)) {
			throw new glacier.exception.InvalidParameter('context', context, 'Context', 'init', 'Drawable');
		}
		
		var	initialized = true,
			shader = context.shaders.get('generic'),
			aabbMax = this.aabb.max,
			aabbMin = this.aabb.min,
			aabbVertices, aabbIndices;
			
		aabbVertices = [
			new glacier.Vector3(aabbMax.x, aabbMax.y, aabbMax.z),
			new glacier.Vector3(aabbMin.x, aabbMax.y, aabbMax.z),
			new glacier.Vector3(aabbMax.x, aabbMax.y, aabbMin.z),
			new glacier.Vector3(aabbMin.x, aabbMax.y, aabbMin.z),
			new glacier.Vector3(aabbMax.x, aabbMin.y, aabbMax.z),
			new glacier.Vector3(aabbMin.x, aabbMin.y, aabbMax.z),
			new glacier.Vector3(aabbMax.x, aabbMin.y, aabbMin.z),
			new glacier.Vector3(aabbMin.x, aabbMin.y, aabbMin.z)
		];
		
		aabbIndices = [ 0, 1, 4, 5, 7, 1, 3, 2, 7, 6, 4, 2, 0, 3, 7, 4, 0, 5, 3, 6, 2, 1, 5, 6 ];
		
		this.buffers.bounding = new glacier.BufferObject(this, context, shader);
		if(this.buffers.bounding.init(aabbVertices, aabbIndices, null, null, glacier.color.RED)) {
			this.buffers.bounding.drawMode = context.gl.LINE_LOOP;
			this.buffers.bounding.elements = 24;
		}
		
		if(typeof options == 'object') {
			if(typeof options.shader == 'string') {
				shader = context.shaders.get(options.shader);
			}
		} else if(options) {
			throw new glacier.exception.InvalidParameter('options', options, 'object', 'init', 'Drawable');
		}
		
		if(!(this.buffers.solid = new glacier.BufferObject(this, context, shader)).init()) {
			return false;
		}
		
		return true;
	}
};
