glacier.context = {}; // Map of contexts

glacier.Context = function(type, options) {
	var c, contextTypes = [];
	
	if(typeof type == 'string') {
		for(c in glacier.context) {
			if(glacier.context.hasOwnProperty(c)) {
				if(c.toLowerCase() == type.toLowerCase()) {
					// Pass second parameter as container if string
					if(typeof options == 'string') {
						options = { container: options };
					}
					
					return new glacier.context[c](options);
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
	foo: function() {
		console.log('foo');
	}
};
