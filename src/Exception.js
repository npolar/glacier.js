glacier.Exception = function Exception(message, properties) {
	this.message = message;
	
	if(typeof properties == 'object') {
		for(var p in properties) {
			if(properties.hasOwnProperty(p)) {
				this[p] = properties[p];
			}
		}
	}
};

glacier.exception = {
	ContextError: function(error, method, className) {
		glacier.Exception.call(this, 'Context error', {
			error:		error,
			method:		method,
			class:		className
		});
	},
	IndexOutOfRange: function(index, range, method, className) {
		glacier.Exception.call(this, 'Index out of range', {
			index: 		index,
			range: 		range,
			method:		method,
			class:		className
		});
	},
	InvalidAssignment: function(variable, value, expected, className) {
		glacier.Exception.call(this, 'Invalid assigment', {
			variable:	variable,
			value: 		value,
			type:		typeof value,
			expected:	expected,
			class:		className
		});
	},
	InvalidParameter: function(parameter, value, expected, method, className) {
		glacier.Exception.call(this, 'Invalid parameter', {
			parameter:	parameter,
			value:		value,
			expected:	expected,
			method:		method,
			class:		className
		});
	},
	InvalidOption: function(option, value, expected, className) {
		glacier.Exception.call(this, 'Invalid option', {
			option:		option,
			value:		value,
			type:		typeof value,
			expected:	expected,
			class:		className
		});
	},
	MissingParameter: function(parameter, method, className) {
		glacier.Exception.call(this, 'Missing parameter', {
			parameter:	parameter,
			method:		method,
			class:		className
		});
	},
	UndefinedElement: function(element, method, className) {
		glacier.Exception.call(this, 'Undefined element', {
			element:	element,
			method:		method,
			class:		className
		});
	}
};
