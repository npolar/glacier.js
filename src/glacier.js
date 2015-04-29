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
	VERSION: '0.1.2',
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
