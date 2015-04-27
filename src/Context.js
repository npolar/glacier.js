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
						throw new glacier.exception.InvalidAssignment('projection', typeof value, 'Matrix44 or null', 'Context');
					}
				}
			}
		});
	} else {
		contextTypes = contextTypes.join(', ');
		var last = contextTypes.lastIndexOf(', ');
		contextTypes = (last >= 0 ? contextTypes.substr(0, last) + ' or' + contextTypes.substr(last + 1) : contextTypes);
		throw new glacier.exception.InvalidParameter('type', type, contextTypes, '(constructor)', 'Context'); 
	}
	
	return ctor;
};

glacier.Context.prototype = {
	clear: function() {
		console.warn('Missing implementation for Context.clear in derived class: ' + this.type);
	},
	draw: function(drawable) {
		console.warn('Missing implementation for Context.draw in derived class: ' + this.type);
	},
	init: function(drawable, options) {
		console.warn('Missing implementation for Context.init in derived class: ' + this.type);
	},
	resize: function(width, height) {
		console.warn('Missing implementation for Context.resize in derived class: ' + this.type);
	}
};
