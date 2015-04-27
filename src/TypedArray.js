glacier.TypedArray = function TypedArray(type, ctor) {
	if(typeof type == 'string') {
		if(ctor && typeof ctor != 'function') {
			throw new glacier.exception.InvalidParameter('ctor', typeof ctor, 'function', '(constructor)', 'TypedArray');
		}
		
		Object.defineProperty(this, 'type', {
			value: { name: type, ctor: ctor }
		});
	} else {
		throw new glacier.exception.InvalidParameter('type', typeof type, 'string', '(constructor)', 'TypedArray');
	}
};

glacier.extend(glacier.TypedArray, Array, {
	push: function(items) {
		var a, args = arguments;
		
		for(a = 0; a < args.length; ++a) {
			if((this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] == this.type.name)) {
				Array.prototype.push.call(this, args[a]);
			} else {
				throw new glacier.exception.InvalidParameter('item', typeof args[a], this.type.name, 'push', 'TypedArray');
			}
		}
		
		return this.length;
	},
	splice: function(index, count, items) {
		var a, args = arguments;
		
		for(a = 2; a < args.length; ++a) {
			if(!(this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] != this.type.name)) {
				throw new glacier.exception.InvalidParameter('item', typeof args[a], this.type.name, 'splice', 'TypedArray');
			}
		}
		
		return Array.prototype.splice.apply(this, args);
	},
	unshift: function(items) {
		var a, args = arguments;
		
		for(a = 0; a < args.length; ++a) {
			if((this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] == this.type.name)) {
				Array.prototype.unshift.call(this, args[a]);
			} else {
				throw new glacier.exception.InvalidParameter('item', typeof args[a], this.type.name, 'unshift', 'TypedArray');
			}
		}
		
		return this.length;
	}
});
