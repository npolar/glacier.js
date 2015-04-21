glacier.context = {}; // Map of contexts

// Context base-class and factory
glacier.Context = function Context(type, options) {
	var c, contextTypes = [], context, projection = null, ctor = null;
	
	if(typeof type == 'string') {
		for(c in glacier.context) {
			if(glacier.context.hasOwnProperty(c)) {
				if(c.toLowerCase() == type.toLowerCase()) {
					// Pass second parameter as container if string
					if(typeof options == 'string') {
						options = { container: options };
					}
					
					ctor = new glacier.context[(type = c)](options);
					break;
				}
				
				contextTypes.push(c);
			}
		}
	}
	
	if(ctor) {
		Object.defineProperties(ctor, {
			type: { value: type },
			projection: {
				get: function() {
					return projection;
				},
				set: function(value) {
					if(value instanceof glacier.Matrix44) {
						projection = value;
					} else if(value === null) {
						projection = null;
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.projection', value: typeof value, expected: 'Matrix44 or null' });
					}
				}
			}
		});
	} else {
		contextTypes = contextTypes.join(', ');
		var last = contextTypes.lastIndexOf(', ');
		contextTypes = (last >= 0 ? contextTypes.substr(0, last) + ' or' + contextTypes.substr(last + 1) : contextTypes);
		glacier.error('INVALID_PARAMETER', { parameter: 'type', value: type, expected: contextTypes, method: 'Context constructor' });
	}
	
	return ctor;
};

glacier.Context.prototype = {
	clear: function() {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'clear', child: this.type, parent: 'Context' });
	},
	draw: function(drawable) {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'draw', child: this.type, parent: 'Context' });
	},
	init: function(drawable, options) {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'init', child: this.type, parent: 'Context' });
	},
	resize: function(width, height) {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'resize', child: this.type, parent: 'Context' });
	}
};
