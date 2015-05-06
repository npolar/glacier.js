glacier.Drawable = function Drawable() {
	// Define matrix and visible members
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
					throw new glacier.exception.InvalidAssignment(property, value, 'number', 'Drawable');
				}
			}
		});
	}, this);
	
	var bufferObject = null;
	
	// Define buffer member
	Object.defineProperty(this, 'buffer', {
		get: function() {
			return bufferObject;
		},
		set: function(value) {
			if(value instanceof glacier.BufferObject) {
				bufferObject = value;
			} else if(value === null) {
				if(bufferObject) {
					bufferObject.free();
				}
				
				bufferObject = null;
			} else {
				throw new glacier.exception.InvalidAssignment('buffer', buffer, 'BufferObject', 'Drawable');
			}
		}
	});
};

glacier.Drawable.prototype = {
	free: function() {
		this.buffer		= null;
		this.matrix		= new glacier.Matrix44();
		this.visible	= true;
	},
	draw: function() {
		if(this.visible && (this.buffer instanceof glacier.BufferObject)) {
			this.buffer.draw();
		}
	},
	init: function(context, options) {
		if(!(context instanceof glacier.Context)) {
			throw new glacier.exception.InvalidParameter('context', typeof context, 'Context', 'init', 'Drawable');
		}
		
		var shader = context.shaders.get('generic');
		
		if(typeof options == 'object') {
			if(typeof options.shader == 'string') {
				shader = context.shaders.get(options.shader);
			}
		} else if(options) {
			throw new glacier.exception.InvalidParameter('options', typeof options, 'object', 'init', 'Drawable');
		}
		
		if(!(this.buffer = new glacier.BufferObject(this, context, shader)).init()) {
			this.buffer = null;
			return false;
		}
		
		return true;
	}
};
