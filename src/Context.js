glacier.context = {}; // Map of contexts

// Context base-class and factory
glacier.Context = function(type, options) {
	var c, contextTypes = [], context;
	
	if(typeof type == 'string') {
		for(c in glacier.context) {
			if(glacier.context.hasOwnProperty(c)) {
				if(c.toLowerCase() == type.toLowerCase()) {
					// Pass second parameter as container if string
					if(typeof options == 'string') {
						options = { container: options };
					}
					
					ctor = new glacier.context[c](options);
					
					Object.defineProperty(ctor, 'type', {
						value: c,
						writable: false
					});
					
					return ctor;
				}
				
				contextTypes.push(c);
			}
		}
	}
		
	contextTypes = contextTypes.join(', ');
	var last = contextTypes.lastIndexOf(', ');
	contextTypes = (last >= 0 ? contextTypes.substr(0, last) + ' or' + contextTypes.substr(last + 1) : contextTypes);
	glacier.error('INVALID_PARAMETER', { parameter: 'type', value: type, expected: contextTypes, method: 'Context constructor' });
	
	return null;
};

glacier.Context.prototype = {
	clear: function() {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'clear', child: this.type, parent: 'Context' });
	},
	resize: function() {
		glacier.warn('MISSING_IMPLEMENTATION', { implementation: 'resize', child: this.type, parent: 'Context' });
	}
};
