/* * * * * * * * * * * * *\
|*    ╔═╗      ╔═╗       *|
|* ╔═╦╣ ║╔═╦╦══╬═╬══╦═╦╗ *|
|* ║' ║ ╚╣' ║ ═╣ ║'╔╣ ╔╝ *|
|* ╠═ ╠══╩═╩╩══╩═╩══╩═╝  *|
|* ╚══╝ WebGL Graph Tool *|
|* * * * * * * * * * * * *|
|*   http://npolar.no/   *|
\* * * * * * * * * * * * */

var glacier = {
	VERSION: '0.1.3',
	AUTHORS: [ 'remi@npolar.no' ]
};

if(typeof module == 'object') {
	module.exports = glacier;
}

glacier.load = function(url, callback) {
	var xhr, async = (typeof callback == 'function' ? true : false);
	
	try { xhr = new XMLHttpRequest(); }
	catch(e) { return false; }
	
	if(async) {
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && (xhr.status == 200 || xhr.status === 0)) {
				callback(xhr.responseText);
			}
		};
	}
	
	try {
		xhr.open('GET', url, async);
		xhr.overrideMimeType('text/plain');
		xhr.send();
	} catch(e) { return false; }
	
	return (async ? true : xhr.responseText);
};

glacier.isArray = function(object, type) {
	var a, arr;
	
	[ Array, Int8Array, Int16Array, Int32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Float32Array, Float64Array ].forEach(function(type) {
		if(!arr && object instanceof type) {
			arr = true;
		}
	});
	
	// Optional content type check
	if(arr && type) {
		if(typeof type == 'function') {
			for(a = 0; a < object.length; ++a) {
				if(!(object[a] instanceof type)) {
					return false;
				}
			}
		} else if(typeof type == 'string') {
			for(a = 0; a < object.length; ++a) {
				if(typeof object[a] != type) {
					return false;
				}
			}
		}
	}
	
	return !!arr;
};

glacier.extend = function(target, source, sourceN) {
	var args = arguments, n, o, obj, p, proto, protos = [];
	
	for(n = 1; n < args.length; ++n) {
		if(args[n] instanceof Object) {
			if(!(p = protos.push(function(){}) - 1)) {
				protos[p].prototype = Object.create(args[n].prototype || args[n]);
			} else {
				protos[p].prototype = Object.create(protos[p - 1].prototype);
				if((obj = args[n].prototype)) {
					for(o in obj) {
						if(obj.hasOwnProperty(o)) {
							protos[p].prototype[o] = obj[o];
						}
					}
				} else if((obj = args[n])) {
					for(o in obj) {
						if(obj.hasOwnProperty(o)) {
							protos[p].prototype[o] = obj[o];
						}
					}
				}
			}
		}
	}
	
	obj = target.prototype;
	target.prototype = Object.create(protos.pop().prototype);
	
	for(n in obj) {
		if(obj.hasOwnProperty(n)) {
			target.prototype[n] = obj[n];
		}
	}
	
	return target;
};

glacier.union = function(members, value, ctor) {
	members = (members instanceof Array ? members : [ members ]);
	
	function addProperty(index) {
		Object.defineProperty(this, members[index], {
			get: function() { return value; },
			set: function(val) {
				if(typeof ctor == 'function') {
					if(val instanceof ctor) {
						value = val;
					} else {
						throw new glacier.exception.InvalidAssignment(members[index], typeof val, ctor.name);
					}
				} else if(typeof val == typeof value) {
					value = val;
				} else {
					throw new glacier.exception.InvalidAssignment(members[index], typeof val, typeof value);
				}
			}
		});
	}
	
	for(var m in members) {
		addProperty.call(this, m);
	}
};

glacier.parseOptions = function(options, defaults, className) {
	var d, o, result = {}, reserved = 'gt,lt,class,not'.split(','), type;
	
	function getDefault(object) {
		if(object instanceof Array) {
			if(object[0] !== undefined && object[0] !== null) {
				if(typeof object[0] == 'object') {
					return getDefault(object);
				}
			}
		} else if(typeof object == 'object') {
			for(o in object) {
				if(object.hasOwnProperty(o) && reserved.indexOf(o) == -1) {
					return object[o];
				}
			}
		}
		
		return null;
	}
	
	function getOverride(value, rules, option) {
		if(rules instanceof Array) {
			var r, valid = [], last;
			
			for(r in rules) {
				valid.push(rules[r] || 'null');
				
				if((rules[r] === null && value === null) || (typeof value === rules[r])) {
					return value;
				}
			}
			
			valid = valid.join(', '); last = valid.lastIndexOf(', ');
			valid = (last >= 0 ? valid.substr(0, last) + ' or' + valid.substr(last + 1) : valid);
			throw new glacier.exception.InvalidOption(option, value, valid, className);
		} else if(typeof rules == 'object') {
			for(type in rules) {
				if(rules.hasOwnProperty(type) && reserved.indexOf(type) == -1) {
					if(typeof rules.class == 'function') {
						if(value instanceof rules.class) {
							return value;
						} else {
							throw new glacier.exception.InvalidOption(option, value, type, className);
						}
					} else if(typeof value == type) {
						if(rules.not !== undefined && value === rules.not) {
							throw new glacier.exception.InvalidOption(option, value, type + ' (except ' + rules.not + ')', className);
						}
						
						if(rules.gt !== undefined && value <= rules.gt) {
							throw new glacier.exception.InvalidOption(option, value, type + ' (greater than ' + rules.gt + ')', className);
						}
						
						if(rules.lt !== undefined && value >= rules.lt) {
							throw new glacier.exception.InvalidOption(option, value, type + ' (less than ' + rules.gt + ')', className);
						}
						
						return value;
					} else {
						throw new glacier.exception.InvalidOption(option, value, type, className);
					}
				}
			}
			
		}
		
		return null;
	}
	
	if(options && typeof options != 'object') {
		throw new glacier.exception.InvalidParameter('options', typeof defaults, 'object', 'parseOptions');
	} else if(!options) {
		options = {};
	}
	
	if(typeof defaults == 'object') {
		for(d in defaults) {
			if(defaults.hasOwnProperty(d)) {
				result[d] = getDefault(defaults[d]);
				
				if(options.hasOwnProperty(d)) {
					result[d] = getOverride(options[d], defaults[d], d);
				}
			}
		}
	} else {
		throw new glacier.exception.InvalidParameter('defaults', typeof defaults, 'object', 'parseOptions');
	}
	
	return result;
};
