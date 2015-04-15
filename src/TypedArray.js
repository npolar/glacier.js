glacier.TypedArray = function(type, ctor) {
	if(typeof type == 'string') {
		if(ctor && typeof ctor != 'function') {
			glacier.error('INVALID_PARAMETER', { parameter: 'ctor', value: typeof ctor, expected: 'function', method: 'TypedArray constructor' });
			ctor = undefined;
		}
		
		Object.defineProperty(this, 'type', {
			value: { name: type, ctor: ctor }
		});
	} else {
		glacier.error('INVALID_PARAMETER', { parameter: 'type', value: typeof type, expected: 'string', method: 'TypedArray constructor' });
	}
};

glacier.extend(glacier.TypedArray, Array, {
	push: function(items) {
		var a, args = arguments;
		
		for(a = 0; a < args.length; ++a) {
			if((this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] == this.type.name)) {
				Array.prototype.push.call(this, args[a]);
			} else {
				glacier.error('INVALID_PARAMETER', { parameter: 'item', value: typeof args[a], expected: this.type.name, method: 'TypedArray.push' });
			}
		}
		
		return this.length;
	},
	splice: function(index, count, items) {
		var a, args = arguments, error;
		
		for(a = 2; a < args.length; ++a) {
			if(!(this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] != this.type.name)) {
				glacier.error('INVALID_PARAMETER', { parameter: 'item', value: typeof args[a], expected: this.type.name, method: 'TypedArray.splice' });
				error = true;
			}
		}
		
		return (error ? [] : Array.prototype.splice.apply(this, args));
	},
	unshift: function(items) {
		var a, args = arguments;
		
		for(a = 0; a < args.length; ++a) {
			if((this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] == this.type.name)) {
				Array.prototype.unshift.call(this, args[a]);
			} else {
				glacier.error('INVALID_PARAMETER', { parameter: 'item', value: typeof args[a], expected: this.type.name, method: 'TypedArray.unshift' });
			}
		}
		
		return this.length;
	}
});
