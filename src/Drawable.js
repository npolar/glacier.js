glacier.Drawable = function Drawable() {
	// Define matrix and visible members
	glacier.union.call(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.union.call(this, 'visible', true);
	
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
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Drawable.' + property, value: typeof value, expected: 'number' });
				}
			}
		});
	}, this);
};

glacier.Drawable.prototype = {
	context: null,
	contextData: null,
	
	draw: function() {
		if(context instanceof glacier.Context) {
			context.draw(this);
		}
	},
	init: function(context) {
		if(context instanceof glacier.Context) {
			if(context.init(this)) {
				this.context = context;
				return true;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: 'context', value: typeof context, expected: 'Context', method: 'Drawable.init' });
		}
		
		return false;
	}
};
