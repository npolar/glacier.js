/* * * * * * * * * * * *\
|*    ╔═╗   ╔═╗ WebGL  *|
|* ╔══╣ ║╔══╣ ╚╦═╦╦══╗ *|
|* ║' ║ ╚╣ '║ '║ ║╠╗╚╣ *|
|* ╠═ ╠══╩══╩══╩══╩══╝ *|
|* ╚══╝ Graphing Tool  *|
|* * * * * * * * * * * *|
|*  http://npolar.no/  *|
\* * * * * * * * * * * */

var glacier = {
	VERSION: '0.0.10'
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

glacier.Camera = function Camera(fieldOfView, aspectRatio, clipNear, clipFar) {
	var args = [ 'fieldOfView', 'aspectRatio', 'clipNear', 'clipFar' ];
	
	// Set clipNear/clipFar defaults if not set
	clipNear = (clipNear || 0.1);
	clipFar	= (clipFar || 100.0);
	
	// Check parameters and declare members fieldOfView, aspectRatio, clipNear and clipFar
	[ fieldOfView, aspectRatio, clipNear, clipFar ].forEach(function(arg, index) {
		if(typeof arg != 'number' || arg <= 0.0) {
			throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'positive number', '(constructor)', 'Camera');
		} else {
			Object.defineProperty(this, args[index], {
				get: function() {
					return arg;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0.0) {
						arg = value;
						this.update();
					} else {
						throw new glacier.exception.InvalidAssignment(args[index], value, 'positive number', 'Camera');
					}
				}
			});
		}
	}, this);
	
	// Declare typed members matrix, position and target
	glacier.union.call(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.union.call(this, 'position', new glacier.Vector3(0, 1, 1), glacier.Vector3);
	glacier.union.call(this, 'target', new glacier.Vector3(0, 0, 0), glacier.Vector3);
	
	this.update();
};

glacier.Camera.prototype = {
	follow: function(target, angle, distance) {
		if(!(target instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('target', typeof target, 'Vector3', 'follow', 'Camera');
		}
		
		if(!(angle instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('angle', typeof target, 'Vector2', 'follow', 'Camera');
		}
		
		if(typeof distance != 'number' || distance <= 0.0) {
			throw new glacier.exception.InvalidParameter('distance', distance, 'positive number', 'follow', 'Camera');
		}
		
		var ver = {}, hor = {}, dir = new glacier.Vector2(glacier.limitAngle(angle.x), glacier.limitAngle(angle.y));
		
		ver.hyp = distance;
		ver.opp = ver.hyp * Math.sin(glacier.degToRad(dir.y));
		ver.adj = ver.hyp * Math.cos(glacier.degToRad(dir.y));
		
		hor.hyp = ver.adj;
		hor.opp = hor.hyp * Math.sin(glacier.degToRad(dir.x));
		hor.adj = hor.hyp * Math.cos(glacier.degToRad(dir.x));
		
		this.target.assign(target);
		
		this.position.x = target.x - hor.opp;
		this.position.y = target.y + ver.opp;
		this.position.z = target.z - hor.adj;
		
		this.update();
	},
	update: function() {
		var z, x, y = new glacier.Vector3(0, 1, 0);
		
		if((z = new glacier.Vector3(this.position).subtract(this.target)).length()) {
			z.normalize();
		}
		
		if((x = y.crossProduct(z)).length()) {
			x.normalize();
		}
		
		if((y = z.crossProduct(x)).length()) {
			y.normalize();
		}
		
		this.matrix.assign(new glacier.Matrix44());
		this.matrix.perspective(this.fieldOfView, this.aspectRatio, this.clipNear, this.clipFar);
		//this.matrix.ortho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
		
		this.matrix.assign(new glacier.Matrix44([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).multiply(this.matrix)).translate(-this.position.x, -this.position.y, -this.position.z);
	}
};

glacier.Color = function Color(params) {
	var a, args, vals, value = 0x000000FF; // rgba
	
	Object.defineProperties(this, {
		r: {
			get: function() {
				return ((value >> 24) & 0xFF);
			},
			set: function(red) {
				if(typeof red == 'number' && red >= 0 && red <= 255) {
					value = (((red & 0xFF) << 24) + (value & 0x00FFFFFF)) >>> 0;
				} else {
					throw new glacier.exception.InvalidAssignment('r', red, 'number between 0 and 255', 'Color');
				}
			}
		},
		g: {
			get: function() {
				return ((value >> 16) & 0xFF);
			},
			set: function(green) {
				if(typeof green == 'number' && green >= 0 && green <= 255) {
					value = (((green & 0xFF) << 16) + (value & 0xFF00FFFF)) >>> 0;
				} else {
					throw new glacier.exception.InvalidAssignment('g', green, 'number between 0 and 255', 'Color');
				}
			}
		},
		b: {
			get: function() {
				return ((value >> 8) & 0xFF);
			},
			set: function(blue) {
				if(typeof blue == 'number' && blue >= 0 && blue <= 255) {
					value = (((blue & 0xFF) << 8) + (value & 0xFFFF00FF)) >>> 0;
				} else {
					throw new glacier.exception.InvalidAssignment('b', blue, 'number between 0 and 255', 'Color');
				}
			}
		},
		a: {
			get: function() {
				return (((value >> 0) & 0xFF) / 255.0);
			},
			set: function(alpha) {
				if(typeof alpha == 'number' && alpha >= 0.0 && alpha <= 1.0) {
					value = ((((alpha * 255) & 0xFF) << 0) + (value & 0xFFFFFF00)) >>> 0;
				} else {
					throw new glacier.exception.InvalidAssignment('a', alpha, 'number between 0.0 and 1.0', 'Color');
				}
			}
		},
		rgb: {
			get: function() {
				return ((value >> 8) & 0xFFFFFF);
			},
			set: function(rgb) {
				if(typeof rgb == 'number' && rgb >= 0x00 && rgb <= 0xFFFFFF) {
					value = (((rgb & 0xFFFFFF) << 8) + (value & 0xFF)) >>> 0;
				} else if(glacier.isArray(rgb)) {
					for(a = 0, vals = []; a < rgb.length; ++a) {
						if(typeof rgb[a] == 'number' && rgb[a] >= 0.0 && rgb[a] <= 1.0) {
							vals.push(rgb[a]);
						} else break;
					}
					
					if(vals.length == 3) {
						this.rgb = (((vals[0] * 255) << 16) + ((vals[1] * 255) << 8) + (vals[2] * 255)) >>> 0;
					} else {
						throw new glacier.exception.InvalidAssignment('rgb', '[' + rgb.join(', ') + ']', 'array[3] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgb = (typeof rgb == 'number' ? '0x' + rgb.toString(16).toUpperCase() : rgb);
					throw new glacier.exception.InvalidAssignment('rgb', rgb, 'RGB as 24-bits integer or array[3] of numbers between 0.0 and 1.0', 'Color');
				}
			}
		},
		rgba: {
			get: function() {
				return value;
			},
			set: function(rgba) {
				if(typeof rgba == 'number' && rgba >= 0x00 && rgba <= 0xFFFFFFFF) {
					value = (rgba & 0xFFFFFFFF) >>> 0;
				} else if(glacier.isArray(rgba)) {
					for(a = 0, vals = []; a < rgba.length; ++a) {
						if(typeof rgba[a] == 'number' && rgba[a] >= 0.0 && rgba[a] <= 1.0) {
							vals.push(rgba[a]);
						} else break;
					}
					
					if(vals.length == 4) {
						this.rgba = (((vals[0] * 255) << 24) + ((vals[1] * 255) << 16) + ((vals[2] * 255) << 8) + (vals[3] * 255)) >>> 0;
					} else {
						throw new glacier.exception.InvalidAssignment('rgba', '[' + rgba.join(', ') + ']', 'array[4] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgba = (typeof rgba == 'number' ? '0x' + rgba.toString(16).toUpperCase() : rgba);
					throw new glacier.exception.InvalidAssignment('rgba', rgb, 'RGBA as 32-bits integer or array[4] of numbers between 0.0 and 1.0', 'Color');
				}
			}
		}
	});
	
	if(params instanceof glacier.Color) {
		this.rgba = params.rgba;
	} else if(glacier.isArray(params)) {
		this.rgba = params;
	} else switch((args = arguments).length) {
		case 1: // (rgb)
			this.rgb = args[0];
			break;
		
		case 2:	// (rgb, a)
			this.rgb = args[0];
			this.a = args[1];
			break;
		
		case 3: // (r, g, b)
		case 4: // (r, g, b, a)
			for(a = 0, vals = []; a < args.length; ++a) {
				if(typeof args[a] == 'number') {
					vals.push(args[a] / (a < 3 ? 255 : 1));
				} else {
					throw new glacier.exception.InvalidParameter(args[a], typeof args[a], 'number', '(constructor)', 'Color');
				}
			}
			
			while(vals.length < 4) {
				vals.push(1.0);
			}
			
			this.rgba = vals;
			break;
		
		default:
	}
};

glacier.Color.prototype = {
	assign: function(rOrColor, g, b, a) {
		if(rOrColor instanceof glacier.Color) {
			this.rgba = rOrColor.rgba;
		} else {
			var args = [ 'r', 'g', 'b' ], r = rOrColor;
			
			[ r, g, b ].forEach(function(arg, index) {
				if(typeof arg != 'number' || arg < 0 || arg > 255) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number between 0 and 255', 'assign', 'Color');
				}
			});
			
			if(a || a === 0.0) {
				if(typeof a != 'number' || a < 0.0 || a > 1.0) {
					throw new glacier.exception.InvalidParameter('a', a, 'number between 0.0 and 1.0', 'assign', 'Color');
				}
			}
			
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = (a || a === 0.0 ? a : 1.0);
		}
		
		return this;
	},
	toArray: function() {
		return new Float32Array([ this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a ]);
	},
	
	toString: function() {
		return ('rgba(' + [ this.r, this.g, this.b, this.a.toFixed(2) ].join(', ') + ')');
	}
};

// Pre-defined colors
glacier.color = {
	get WHITE()		{ return new glacier.Color(0xFFFFFF, 1.0); },
	get SILVER()	{ return new glacier.Color(0xC0C0C0, 1.0); },
	get GRAY()		{ return new glacier.Color(0x808080, 1.0); },
	get BLACK()		{ return new glacier.Color(0x000000, 1.0); },
	get RED()		{ return new glacier.Color(0xFF0000, 1.0); },
	get MAROON()	{ return new glacier.Color(0x800000, 1.0); },
	get YELLOW()	{ return new glacier.Color(0xFFFF00, 1.0); },
	get OLIVE()		{ return new glacier.Color(0x808000, 1.0); },
	get LIME()		{ return new glacier.Color(0x00FF00, 1.0); },
	get GREEN()		{ return new glacier.Color(0x008000, 1.0); },
	get AQUA()		{ return new glacier.Color(0x00FFFF, 1.0); },
	get TEAL()		{ return new glacier.Color(0x008080, 1.0); },
	get BLUE()		{ return new glacier.Color(0x0000FF, 1.0); },
	get NAVY()		{ return new glacier.Color(0x000080, 1.0); },
	get FUCHSIA()	{ return new glacier.Color(0xFF00FF, 1.0); },
	get PURPLE()	{ return new glacier.Color(0x800080, 1.0); }
};

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
					throw new glacier.exception.InvalidAssignment(property, typeof value, 'number', 'Drawable');
				}
			}
		});
	}, this);
};

glacier.Drawable.prototype = {
	context: null,
	contextData: null,
	
	free: function() {
		this.context		= null;
		this.contextData	= null;
		this.matrix			= new glacier.Matrix44();
		this.visible		= true;
	},
	draw: function() {
		if(this.context instanceof glacier.Context) {
			this.context.draw(this);
		}
	},
	init: function(context, options) {
		if(context instanceof glacier.Context) {
			if(options && typeof options != 'object') {
				throw new glacier.exception.InvalidParameter('options', typeof options, 'object', 'init', 'Drawable');
			}
			
			if(context.init(this, options)) {
				this.context = context;
				return true;
			}
		} else {
			throw new glacier.exception.InvalidParameter('context', typeof context, 'Context', 'init', 'Drawable');
		}
		
		return false;
	}
};

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
	ContextError: function(context, error, method, className) {
		glacier.Exception.call(this, 'Context error', {
			context:	context,
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

glacier.Texture = function Texture(source) {
	var image = null;
	
	Object.defineProperties(this, {
		callbacks: { value: [] },
		image: {
			get: function() {
				return image;
			},
			set: function(value) {
				if(value instanceof Image || value === null) {
					image = value;
				} else {
					throw new glacier.exception.InvalidAssignment('image', typeof value, 'Image or null', 'Texture');
				}
			}
		}
	});
	
	if(typeof source == 'string') {
		this.load(source);
	} else if(source) {
		throw new glacier.exception.InvalidParameter('source', typeof source, 'Image', '(constructor)', 'Texture');
	}
};

glacier.Texture.prototype = {
	free: function() {
		this.image = null;
	},
	load: function(source) {
		if(typeof source != 'string') {
			throw new glacier.exception.InvalidParameter('source', typeof source, 'string', 'load', 'Texture');
		}
		
		var self = this, image = new Image(), c;
		
		image.onload = function() {
			if(!image.width || !image.height) {
				self.image = null;
				return;
			}
			
			self.image = image;
			
			self.callbacks.forEach(function(callback) {
				if(typeof callback == 'function') {
					callback(image);
				}
			});
		};
		
		image.src = source;
	},
	onLoad: function(callback) {
		if(typeof callback == 'function') {
			this.callbacks.push(callback);
		}
		
		if(this.image) {
			callback(this.image);
		}
	},
	get height() {
		return (this.image ? this.image.height : 0);
	},
	get width() {
		return (this.image ? this.image.width : 0);
	}
};

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

glacier.EPSILON = 10e-5;

glacier.compare = function(value1, value2) {
	var e, val1Arr = glacier.isArray(value1), val2Arr = glacier.isArray(value2);
	
	if(val1Arr && val2Arr) {
		if(value1.length == value2.length) {
			for(e = 0; e < value1.length; ++e) {
				if(typeof value1[e] == 'number' && typeof value2[e] == 'number') {
					if(Math.abs(value1[e] - value2[e]) >= glacier.EPSILON) {
						return false;
					}
				} else if(value1 !== value2) {
					return false;
				}
			}
			
			return true;
		}
	} else if(val1Arr || val2Arr) {
		var arr = (val1Arr ? value1 : value2), val = (val1Arr ? value2 : value1);
		
		for(e = 0; e < arr.length; ++e) {
			if(typeof arr[e] == 'number' && typeof val == 'number') {
				if(Math.abs(arr[e] - val) >= glacier.EPSILON) {
					return false;
				}
			} else if(arr[e] !== val) {
				return false;
			}
		}
		
		return true;
	} else if(typeof value1 == 'number' && typeof value2 == 'number') {
		return (Math.abs(value1 - value2) < glacier.EPSILON);
	} else {
		return (value1 === value2);
	}
	
	return false;
};

glacier.degToRad = function(degrees) {
	if(typeof degrees != 'number') {
		throw new glacier.exception.InvalidParameter('degrees', typeof degrees, 'number', 'degToRad');
	}
	
	return (degrees * Math.PI / 180.0);
};

glacier.radToDeg = function(radians) {
	if(typeof radians != 'number') {
		throw new glacier.exception.InvalidParameter('radians', typeof radians, 'number', 'radToDeg');
	}
	
	return (radians * 180.0 / Math.PI);
};

glacier.limitAngle = function(angle, max, min) {
	if(typeof angle != 'number') {
		throw new glacier.exception.InvalidParameter('angle', typeof angle, 'number', 'limitAngle');
	}
	
	if(typeof (max = (max === undefined ? 360.0 : max)) != 'number') {
		throw new glacier.exception.InvalidParameter('max', typeof max, 'number', 'limitAngle');
	}
	
	if(typeof (min = (min === undefined ? 0.0 : min)) != 'number') {
		throw new glacier.exception.InvalidParameter('min', typeof min, 'number', 'limitAngle');
	}
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	while(angle > max) angle -= max;
	while(angle < min) angle += max;
	
	return angle;
};

glacier.clamp = function(value, min, max) {
	var args = [ 'value', 'min', 'max' ];
	[ value, min, max ].forEach(function(arg, index) {
		if(typeof arg != 'number') {
			throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'clamp');
		}
	});
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	return Math.max(min, Math.min(max, value));
};

glacier.context.WebGL = function WebGLContext(options) {
	options = (typeof options == 'object' ? options : {});
	
	var background, canvas, container, context;
	
	if(options.container instanceof HTMLElement) {
		container = options.container;
	} else if(typeof options.container == 'string') {
		if(!(container = document.getElementById(options.container))) {
			throw new glacier.exception.UndefinedElement(options.container, '(constructor)', 'context.WebGL');
		}
	} else {
		throw new glacier.exception.MissingParameter('container', '(constructor)', 'context.WebGL');
	}
	
	if(container instanceof HTMLCanvasElement) {
		canvas = container;
	} else if(container instanceof HTMLElement) {
		canvas = document.createElement('CANVAS');
		
		canvas.style.position = 'relative;';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		container.appendChild(canvas);
	}
	
	if(canvas instanceof HTMLCanvasElement) {
		Object.defineProperties(this, {
			canvas:	{
				value: canvas
			},
			width: {
				get: function() {
					return this.canvas.width;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						this.resize(value, height);
					} else {
						throw new glacier.exception.InvalidAssignment('width', value, 'positive number', 'Context');
					}
				}
			},
			height: {
				get: function() {
					return this.canvas.height;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						this.resize(width, value);
					} else {
						throw new glacier.exception.InvalidAssignment('height', value, 'positive number', 'Context');
					}
				}
			}
		});
		
		this.canvas.width	= canvas.offsetWidth;
		this.canvas.height	= canvas.offsetHeight;
		
		window.addEventListener('resize', function(event) {
			if(canvas.width != canvas.offsetWidth || canvas.height != canvas.offsetHeight) {
				this.resize(canvas.offsetWidth, canvas.offsetHeight);
			}
		}.bind(this));
		
		if((context = this.canvas.getContext('webgl'))) {
			Object.defineProperty(this, 'gl', { value: context });
		}
		
		if(this.gl) {
			Object.defineProperties(this, {
				background: {
					get: function() {
						return background;
					},
					set: function(color) {
						if(color instanceof glacier.Color) {
							background = color;
							this.gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a);
							this.gl.clear(this.gl.COLOR_BUFFER_BIT);
						} else {
							throw new glacier.exception.InvalidAssignment('background', typeof color, 'Color', 'Context');
						}
					}
				},
				shaderBank: {
					value: new glacier.context.WebGL.ShaderBank(this)
				}
			});
			
			this.background = glacier.color.BLACK;
			this.shaderBank.init();
		}
		
		this.clear();
	}
};

glacier.extend(glacier.context.WebGL, glacier.Context, {
	// Overloaded members
	clear: function() {
		if(this.gl) {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}
	},
	draw: function(drawable) {
		if(drawable instanceof glacier.Drawable) {
			if(drawable.contextData instanceof glacier.context.WebGL.ContextData) {
				drawable.contextData.draw();
			}
		}
	},
	init: function(drawable, options) {
		var data, self = this, shader = self.shaderBank.shader('generic');
		
		if(typeof options == 'object') {
			if(typeof options.shader == 'string') {
				shader = self.shaderBank.shader(options.shader);
			}
		}
		
		if(drawable instanceof glacier.Mesh) {
			data = new glacier.context.WebGL.ContextData(drawable, self, self.gl.TRIANGLES, shader);
			
			if(data.init(drawable.vertices, drawable.indices, drawable.normals, drawable.texCoords, drawable.colors)) {
				drawable.texture0.onLoad(function(image) { data.textures[0] = self.createTexture(image); });
				drawable.texture1.onLoad(function(image) { data.textures[1] = self.createTexture(image); });
				drawable.texture2.onLoad(function(image) { data.textures[2] = self.createTexture(image); });
				drawable.texture3.onLoad(function(image) { data.textures[3] = self.createTexture(image); });
				drawable.contextData = data;
				return true;
			}
			
			return false;
		} else if(drawable instanceof glacier.PointCollection) {
			data = new glacier.context.WebGL.ContextData(drawable, self, self.gl.POINTS, shader);
			
			if(data.init(drawable.vertices, null, null, null, drawable.colors)) {
				drawable.contextData = data;
				return true;
			}
		}
		
		// TODO: initialization of other drawables
		
		throw new glacier.exception.InvalidParameter('drawable', typeof drawable, 'Mesh', 'init', 'context.WebGL');
	},
	resize:	function(width, height) {
		if(typeof width != 'number' || width <= 0.0) {
			throw new glacier.exception.InvalidParameter('width', typeof width, 'positive number', 'resize', 'context.WebGL');
		}
		
		if(typeof height != 'number' || height <= 0.0) {
			throw new glacier.exception.InvalidParameter('height', typeof height, 'positive number', 'resize', 'context.WebGL');
		}
		
		if(this.canvas) {
			this.canvas.width	= width;
			this.canvas.height	= height;
		}
		
		if(this.gl) {
			this.gl.viewport(0, 0, width, height);
		}
	},
	
	// Unique members
	createProgram: function(vertShader, fragShader) {
		if(!this.gl) {
			throw new glacier.exception.ContextError('WebGL', 'uninitialized context', 'createProgram', 'context.WebGL');
		}
		
		if(!(vertShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('vertShader', typeof vertShader, 'WebGLShader', 'createProgram', 'context.WebGL');
		}
		
		if(!(fragShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('fragShader', typeof fragShader, 'WebGLShader', 'createProgram', 'context.WebGL');
		}
		
		var gl = this.gl, program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
		
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn(gl.getProgramInfoLog(program));
			return null;
		}
		
		return program;
	},
	createShader: function(type, source) {
		if(!this.gl) {
			throw new glacier.exception.ContextError('WebGL', 'uninitialized context', 'createShader', 'context.WebGL');
		}
		
		var gl = this.gl, last, shader, valid = [ gl.FRAGMENT_SHADER, gl.VERTEX_SHADER ];
		
		if(typeof source != 'string') {
			throw new glacier.exception.InvalidParameter('source', typeof source, 'string', 'createShader', 'context.WebGL');
		}
		
		if(valid.indexOf(type) == -1) {
			last = (valid = valid.join(', ')).lastIndexOf(', ');
			valid = (last >= 0 ? valid.substr(0, last) + ' or' + valid.substr(last + 1) : valid);
			throw new glacier.exception.InvalidParameter('type', type, valid, 'createShader', 'context.WebGL');
		}
		
		shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		
		if(!gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.warn(gl.getShaderInfoLog(shader));
			return null;
		}
		
		return shader;
	},
	createTexture: function(image) {
		if(!this.gl) {
			throw new glacier.exception.ContextError('WebGL', 'uninitialized context', 'createTexture', 'context.WebGL');
		}
		
		if(image instanceof Image) {
			var gl = this.gl, tex = gl.createTexture();
			
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			
			return tex;
		}
		
		throw new glacier.exception.InvalidParameter('image', typeof image, 'Image', 'createTexture', 'context.WebGL');
	}
});

glacier.Mesh = function Mesh() {
	// Call super constructor
	glacier.Drawable.call(this);

	// Define buffer arrays
	Object.defineProperties(this, {
		colors: 	{ value: new glacier.TypedArray('Color', glacier.Color) },
		indices:	{ value: new glacier.TypedArray('number') },
		normals:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) },
		texCoords:	{ value: new glacier.TypedArray('Vector2', glacier.Vector2) },
		vertices:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) }
	});
	
	// Define texture properties
	[ 0, 1, 2, 3 ].forEach(function(number) {
		var tex = new glacier.Texture(), property = 'texture' + number;
		
		Object.defineProperty(this, property, {
			get: function() {
				return tex;
			},
			set: function(value) {
				if(typeof value == 'string') {
					tex.load(value);
				} else if(value === null) {
					tex.free();
				} else {
					throw new glacier.exception.InvalidAssignment(property, typeof value, 'string or null', 'Mesh');
				}
			}
		});
	}, this);
};

// glacier.Mesh extends glacier.Drawable
glacier.extend(glacier.Mesh, glacier.Drawable, {
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.indices.length	 	= 0;
		this.normals.length		= 0;
		this.texCoords.length	= 0;
		this.vertices.length	= 0;
	}
});

glacier.PointCollection = function PointCollection() {
	// Call super constructor
	glacier.Drawable.call(this);
	
	// Define buffer arrays
	Object.defineProperties(this, {
		colors: 	{ value: new glacier.TypedArray('Color', glacier.Color) },
		vertices:	{ value: new glacier.TypedArray('Vector3', glacier.Vector3) }
	});
};

// glacier.PointCollection extends glacier.Drawable
glacier.extend(glacier.PointCollection, glacier.Drawable, {
	addPoint: function(vec3, color) {
		if(!(vec3 instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('vec3', typeof vec3, 'Vector3', 'addPoint', 'PointCollection');
		}
		
		if(!color || (color instanceof glacier.Color)) {
			this.colors.push(color || glacier.color.WHITE);
		} else {
			throw new glacier.exception.InvalidParameter('color', typeof color, 'Color', 'addPoint', 'PointCollection');
		}
		
		this.vertices.push(vec3);
	},
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.vertices.length	= 0;
	}
});

glacier.Matrix33 = function Matrix33(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]),
	});
	
	if(value) {
		this.assign(value);
	}
};

glacier.Matrix33.prototype = {
	assign: function(value) {
		var row, col, e;
		
		if(value instanceof glacier.Matrix33) {
			for(e in value.array) {
				this.array[e] = value.array[e];
			}
		} else if(value instanceof glacier.Matrix44) {
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					this.array[(col * 3) + row] = value.array[(col * 4) + row];
				}
			}
		} else if(glacier.isArray(value) && value.length == 9) {
			for(e = 0; e < value.length; ++e) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Matrix33, Matrix44 or array[9]', 'assign', 'Matrix33');
		}
		
		return this;
	},
	
	determinant: function() {
		return (this.array[0] * (this.array[4] * this.array[8] - this.array[5] * this.array[7]) -
				this.array[1] * (this.array[3] * this.array[8] - this.array[5] * this.array[6]) +
				this.array[2] * (this.array[3] * this.array[7] - this.array[4] * this.array[6]));
	},
	
	element: function(colOrIndex, row) {
		if(typeof row == 'number' && typeof colOrIndex == 'number') {
			if(row >= 0 && row <= 3 && colOrIndex >= 0 && colOrIndex <= 3) {
				return this.array[(colOrIndex * 3) + row];
			}
		} else if(typeof colOrIndex == 'number') {
			return this.array[colOrIndex];
		}
		
		throw new glacier.exception.IndexOutOfRange(colOrIndex + (row || 0), '0-9', 'element', 'Matrix33');
	},
	
	multiply: function(value) {
		var col, row, e, temp;
		
		if(value instanceof glacier.Matrix33) {
			temp = new Float32Array(this.array);
			
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					this.array[(col * 3) + row] = ((temp[(col * 3) + 0] * value.array[(0 * 3) + row]) +
												   (temp[(col * 3) + 1] * value.array[(1 * 3) + row]) +
												   (temp[(col * 3) + 2] * value.array[(2 * 3) + row]));
				}
			}
		} else if(value instanceof glacier.Matrix44) {
			this.multiply(new glacier.Matrix33(value));
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Matrix33 or Matrix44', 'multiply', 'Matrix33');
		}
		
		return this;
	},
	
	transpose: function() {
		var temp;
		
		temp = this.array[1];
		this.array[1] = this.array[3];
		this.array[3] = temp;
		
		temp = this.array[2];
		this.array[2] = this.array[6];
		this.array[6] = temp;
		
		temp = this.array[5];
		this.array[5] = this.array[7];
		this.array[7] = temp;
		
		return this;
	},
	
	transposed: function() {
		var temp = new glacier.Matrix33(this);
		return temp.transpose();
	},
	
	inverse: function() {
		var temp = new glacier.Matrix33(this);
		
		if(!temp.invert()) {
			console.warn('Inverse matrix does not exist: ' + temp.toString());
			return undefined;
		}
		
		return temp;
	},
	
	invert: function() {
		var temp = new Float32Array([
			this.array[4] * this.array[8] - this.array[5] * this.array[7],
			this.array[2] * this.array[7] - this.array[1] * this.array[8],
			this.array[1] * this.array[5] - this.array[2] * this.array[4],
			this.array[5] * this.array[6] - this.array[3] * this.array[8],
			this.array[0] * this.array[8] - this.array[2] * this.array[6],
			this.array[2] * this.array[3] - this.array[0] * this.array[5],
			this.array[3] * this.array[7] - this.array[4] * this.array[6],
			this.array[1] * this.array[6] - this.array[0] * this.array[7],
			this.array[0] * this.array[4] - this.array[1] * this.array[3]
		]);
		
		var det = (this.array[0] * temp[0] + this.array[1] * temp[3] + this.array[2] * temp[6]);
		
		if(glacier.compare(det, 0.0))
			return false;
		
		det = 1.0 / det;
		
		for(var e = 0; e < temp.length; ++e) {
			this.array[e] = (temp[e] * det);
		}
		
		return true;
	},
	
	toString: function() {
		return ('[[' + this.array[0].toPrecision(5) + ', ' + this.array[1].toPrecision(5) + ', ' + this.array[2].toPrecision(5) + '], ' +
				 '[' + this.array[3].toPrecision(5) + ', ' + this.array[4].toPrecision(5) + ', ' + this.array[5].toPrecision(5) + '], ' +
				 '[' + this.array[6].toPrecision(5) + ', ' + this.array[7].toPrecision(5) + ', ' + this.array[8].toPrecision(5) + ']]');
	}
};

glacier.Matrix44 = function Matrix44(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ]),
	});
	
	if(value) {
		this.assign(value);
	}
};

glacier.Matrix44.prototype = {
	assign: function(value) {
		var row, col, e;
		
		if(value instanceof glacier.Matrix33) {
			for(col = 0; col < 3; ++col) {
				for(row = 0; row < 3; ++row) {
					this.array[(col * 4) + row] = value.array[(col * 3) + row];
				}
			}
			
			this.array[ 3] = this.array[ 7] = this.array[11] = 0.0;
			this.array[12] = this.array[13] = this.array[14] = 0.0;
			this.array[16] = 1.0;
		} else if(value instanceof glacier.Matrix44) {
			for(e in value.array) {
				this.array[e] = value.array[e];
			}
			
		} else if(glacier.isArray(value) && value.length == 16) {
			for(e = 0; e < value.length; ++e) {
				this.array[e] = value[e];
			}
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] = value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Matrix33, Matrix44 or array[16]', 'assign', 'Matrix44');
		}
		
		return this;
	},
	
	determinant: function() {
		var a0 = this.array[ 0] * this.array[ 5] - this.array[ 1] * this.array[ 4];
		var a1 = this.array[ 0] * this.array[ 6] - this.array[ 2] * this.array[ 4];
		var a2 = this.array[ 0] * this.array[ 7] - this.array[ 3] * this.array[ 4];
		var a3 = this.array[ 1] * this.array[ 6] - this.array[ 2] * this.array[ 5];
		var a4 = this.array[ 1] * this.array[ 7] - this.array[ 3] * this.array[ 5];
		var a5 = this.array[ 2] * this.array[ 7] - this.array[ 3] * this.array[ 6];
		var b0 = this.array[ 8] * this.array[13] - this.array[ 9] * this.array[12];
		var b1 = this.array[ 8] * this.array[14] - this.array[10] * this.array[12];
		var b2 = this.array[ 8] * this.array[15] - this.array[11] * this.array[12];
		var b3 = this.array[ 9] * this.array[14] - this.array[10] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[11] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		return (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
	},

	element: function(colOrIndex, row) {
		if(typeof row == 'number' && typeof colOrIndex == 'number') {
			if(row >= 0 && row <= 4 && colOrIndex >= 0 && colOrIndex <= 4) {
				return this.array[(colOrIndex * 4) + row];
			}
		} else if(typeof colOrIndex == 'number') {
			return this.array[colOrIndex];
		}
		
		throw new glacier.exception.IndexOutOfRange(colOrIndex + (row || 0), '0-16', 'element', 'Matrix44');
	},
	
	frustum: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(','), dX, dY, dZ;
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'frustum', 'Matrix44');
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(near <= 0.0 || far <= 0.0 || (dX = right - left) <= 0.0 || (dY = top - bottom) <= 0.0 || (dZ = far - near) <= 0.0) {
			return false;
		}
		
		this.assign(new glacier.Matrix44([
			2.0 * near / dX, 0.0, 0.0, 0.0,
			0.0, 2.0 * near / dY, 0.0, 0.0,
			(right + left) / dX, (top + bottom) / dY, -(near + far) / dZ, -1.0,
			0.0, 0.0, -2.0 * near * far / dZ, 0.0
		]).multiply(this));
		
		return true;
	},
	
	inverse: function() {
		var temp = new glacier.Matrix44(this);
		
		if(!temp.invert()) {
			console.warn('Inverse matrix does not exist: ' + temp.toString());
			return undefined;
		}
		
		return temp;
	},
	
	invert: function() {
		var a0 = this.array[ 0] * this.array[ 5] - this.array[ 1] * this.array[ 4];
		var a1 = this.array[ 0] * this.array[ 6] - this.array[ 2] * this.array[ 4];
		var a2 = this.array[ 0] * this.array[ 7] - this.array[ 3] * this.array[ 4];
		var a3 = this.array[ 1] * this.array[ 6] - this.array[ 2] * this.array[ 5];
		var a4 = this.array[ 1] * this.array[ 7] - this.array[ 3] * this.array[ 5];
		var a5 = this.array[ 2] * this.array[ 7] - this.array[ 3] * this.array[ 6];
		var b0 = this.array[ 8] * this.array[13] - this.array[ 9] * this.array[12];
		var b1 = this.array[ 8] * this.array[14] - this.array[10] * this.array[12];
		var b2 = this.array[ 8] * this.array[15] - this.array[11] * this.array[12];
		var b3 = this.array[ 9] * this.array[14] - this.array[10] * this.array[13];
		var b4 = this.array[ 9] * this.array[15] - this.array[11] * this.array[13];
		var b5 = this.array[10] * this.array[15] - this.array[11] * this.array[14];
		
		var det = (a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0);
		
		if(glacier.compare(det, 0.0))
			return false;
		
		var temp = new Float32Array([
			 this.array[ 5] * b5 - this.array[ 6] * b4 + this.array[ 7] * b3,
			-this.array[ 1] * b5 + this.array[ 2] * b4 - this.array[ 3] * b3,
			 this.array[13] * a5 - this.array[14] * a4 + this.array[15] * a3,
			-this.array[ 9] * a5 + this.array[10] * a4 - this.array[11] * a3,
			-this.array[ 4] * b5 + this.array[ 6] * b2 - this.array[ 7] * b1,
			 this.array[ 0] * b5 - this.array[ 2] * b2 + this.array[ 3] * b1,
			-this.array[12] * a5 + this.array[14] * a2 - this.array[15] * a1,
			 this.array[ 8] * a5 - this.array[10] * a2 + this.array[11] * a1,
			 this.array[ 4] * b4 - this.array[ 5] * b2 + this.array[ 7] * b0,
			-this.array[ 0] * b4 + this.array[ 1] * b2 - this.array[ 3] * b0,
			 this.array[12] * a4 - this.array[13] * a2 + this.array[15] * a0,
			-this.array[ 8] * a4 + this.array[ 9] * a2 - this.array[11] * a0,
			-this.array[ 4] * b3 + this.array[ 5] * b1 - this.array[ 6] * b0,
			 this.array[ 0] * b3 - this.array[ 1] * b1 + this.array[ 2] * b0,
			-this.array[12] * a3 + this.array[13] * a1 - this.array[14] * a0,
			 this.array[ 8] * a3 - this.array[ 9] * a1 + this.array[10] * a0 
		]);
		
		det = 1.0 / det;
		
		for(var e = 0; e < temp.length; ++e) {
			this.array[e] = (temp[e] * det);
		}
		
		return true;
	},
	
	multiply: function(value) {
		var col, row, e, temp;
		
		if(value instanceof glacier.Matrix44) {
			temp = new Float32Array(this.array);
			
			for(col = 0; col < 4; ++col) {
				for(row = 0; row < 4; ++row) {
					this.array[(col * 4) + row] = ((temp[(col * 4) + 0] * value.array[(0 * 4) + row]) +
												   (temp[(col * 4) + 1] * value.array[(1 * 4) + row]) +
												   (temp[(col * 4) + 2] * value.array[(2 * 4) + row]) +
												   (temp[(col * 4) + 3] * value.array[(3 * 4) + row]));
				}
			}
		} else if(value instanceof glacier.Matrix33) {
			this.multiply(new glacier.Matrix44(value));
		} else if(typeof value == 'number') {
			for(e in this.array) {
				this.array[e] *= value;
			}
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Matrix33 or Matrix44', 'multiply', 'Matrix44');
		}
		
		return this;
	},
	
	ortho: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(',');
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'ortho', 'Matrix44');
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(!(dX = right - left) || !(dY = top - bottom) || !(dZ = far - near)) {
			return false;
		}
		
		this.assign(new glacier.Matrix44([
			2.0 / dX, 0.0, 0.0, 0.0,
			0.0, 2.0 / dY, 0.0, 0.0,
			0.0, 0.0, -2.0 / dZ, 0.0,
			-(right + left) / dX, -(top + bottom) / dY, -(near + far) / dZ, 1.0
		]).multiply(this));
		
		return true;
	},
	
	perspective: function(verticalViewAngle, aspectRatio, near, far) {
		var args = 'verticalViewAngle,aspectRatio,near,far'.split(','), height, width, temp = new glacier.Matrix44();
		
		[ verticalViewAngle, aspectRatio, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'perspective', 'Matrix44');
			}
		});
		
		if(near <= 0.0 || far <= 0.0) {
			return false;
		}
		
		height = Math.tan((verticalViewAngle / 360.0) * Math.PI) * near;
		width = height * aspectRatio;
		
		if(temp.frustum(-width, width, -height, height, near, far)) {
			this.assign(temp.multiply(this));
			return true;
		}
		
		return false;
	},
	
	rotate: function(radians, xOrVec3, y, z) {
		if(typeof radians != 'number') {
			throw new glacier.exception.InvalidParameter('radians', typeof radians, 'number', 'rotate', 'Matrix44');
		} else if(xOrVec3 instanceof glacier.Vector3) {
			return this.rotate(radians, xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3, cosRad, sinRad, mag, oneMinusCos;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'rotate', 'Matrix44');
				}
			});
			
			oneMinusCos = 1.0 - (cosRad = Math.cos(radians));
			sinRad = Math.sin(radians);
			
			if(!isNaN((mag = Math.sqrt(x * x + y * y + z * z)))) {
				x /= mag;
				y /= mag;
				z /= mag;
				
				this.assign(new glacier.Matrix44([
					(oneMinusCos * (x * x)) + cosRad, (oneMinusCos * (x * y)) - (z * sinRad), (oneMinusCos * (x * z)) + (y * sinRad), 0.0,	// X rotation
					(oneMinusCos * (y * x)) + (z * sinRad), (oneMinusCos * (y * y)) + cosRad, (oneMinusCos * (y * z)) - (x * sinRad), 0.0,	// Y rotation
					(oneMinusCos * (z * x)) - (y * sinRad), (oneMinusCos * (z * y)) + (x * sinRad), (oneMinusCos * (z * z)) + cosRad, 0.0,	// Z rotation
					0.0, 0.0, 0.0, 1.0
				]).multiply(this));
			}
		}
		
		return this;
	},
	
	scale: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.scale(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'scale', 'Matrix44');
				}
			});
			
			this.array[ 0] *= x; this.array[ 4] *= y; this.array[ 8] *= z;
			this.array[ 1] *= x; this.array[ 5] *= y; this.array[ 9] *= z;
			this.array[ 2] *= x; this.array[ 6] *= y; this.array[10] *= z;
			this.array[ 3] *= x; this.array[ 7] *= y; this.array[11] *= z;
		}
		
		return this;
	},
	
	toString: function() {
		return ('[[' + this.array[ 0].toPrecision(5) + ', ' + this.array[ 1].toPrecision(5) + ', ' + this.array[ 2].toPrecision(5) + ', ' + this.array[ 3].toPrecision(5) + '], ' +
				 '[' + this.array[ 4].toPrecision(5) + ', ' + this.array[ 5].toPrecision(5) + ', ' + this.array[ 6].toPrecision(5) + ', ' + this.array[ 7].toPrecision(5) + '], ' +
				 '[' + this.array[ 8].toPrecision(5) + ', ' + this.array[ 9].toPrecision(5) + ', ' + this.array[10].toPrecision(5) + ', ' + this.array[11].toPrecision(5) + '], ' +
				 '[' + this.array[12].toPrecision(5) + ', ' + this.array[13].toPrecision(5) + ', ' + this.array[14].toPrecision(5) + ', ' + this.array[15].toPrecision(5) + ']]');
	},
	
	translate: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.translate(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'translate', 'Matrix44');
				}
			});
			
			this.array[12] += (this.array[ 0] * x + this.array[ 4] * y + this.array[ 8] * z);
			this.array[13] += (this.array[ 1] * x + this.array[ 5] * y + this.array[ 9] * z);
			this.array[14] += (this.array[ 2] * x + this.array[ 6] * y + this.array[10] * z);
			this.array[15] += (this.array[ 3] * x + this.array[ 7] * y + this.array[11] * z);
		}
		
		return this;
	},
	
	transpose: function() {
		var temp;
		
		temp = this.array[1];
		this.array[1] = this.array[4];
		this.array[4] = temp;
		
		temp = this.array[2];
		this.array[2] = this.array[8];
		this.array[8] = temp;
		
		temp = this.array[3];
		this.array[3] = this.array[12];
		this.array[12] = temp;
		
		temp = this.array[6];
		this.array[6] = this.array[9];
		this.array[9] = temp;
		
		temp = this.array[7];
		this.array[7] = this.array[13];
		this.array[13] = temp;
		
		temp = this.array[11];
		this.array[11] = this.array[14];
		this.array[14] = temp;
		
		return this;
	},
	
	transposed: function() {
		var temp = new glacier.Matrix44(this);
		return temp.transpose();
	}
};

glacier.Vector2 = function Vector2(x, y) {
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	
	if(x instanceof glacier.Vector2) {
		this.assign(x);
	}
};

glacier.Vector2.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x += value.x;
			this.y += value.y;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector2', 'add', 'Vector2');
		}
		
		return this;
	},
	
	assign: function(xOrVec2, y) {
		if(xOrVec2 instanceof glacier.Vector2) {
			return this.assign(xOrVec2.x, xOrVec2.y);
		} else {
			var args = [ 'x', 'y' ], x = xOrVec2;
			
			[ x, y ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'assign', 'Vector2');
				}
			});
			
			this.x = x;
			this.y = y;
		}
		
		return this;
	},

	distance: function(vec2) {
		var dx = this.x - vec2.x, dy = this.y - vec2.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x /= value.x;
			this.y /= value.y;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector2', 'divide', 'Vector2');
		}
		
		return this;
	},
	
	dotProduct: function(vec2) {
		return ((this.x * vec2.x) + (this.y * vec2.y));
	},
	
	length: function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x *= value.x;
			this.y *= value.y;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector2', 'multiply', 'Vector2');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.x *= inverted;
		this.y *= inverted;
		
		return this;
	},
	
	rotate: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.y * sinRad));
		var rotY = ((this.x * sinRad) + (this.y * cosRad));
		
		this.x = rotX;
		this.y = rotY;
		
		return this;
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x -= value.x;
			this.y -= value.y;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector2', 'subtract', 'Vector2');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	},
	
	get array() {
		return new Float32Array([ this.x, this.y ]);
	}
};

glacier.Vector3 = function Vector3(x, y, z) {
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	glacier.union.call(this, ['z', 'w'], (typeof z == 'number' ? z : 0.0));
	
	if(x instanceof glacier.Vector3) {
		this.assign(x);
	}
};

glacier.Vector3.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
			this.z += value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector3', 'add', 'Vector3');
		}
		
		return this;
	},
	
	angle: function(vec3) {
		var angle = Math.acos(this.dotProduct(vec3) / (this.length() * vec3.length()));
		return (isNaN(angle) ? 0.0 : angle);
	},
	
	assign: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.assign(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], typeof arg, 'number', 'assign', 'Vector3');
				}
			});
			
			this.x = x;
			this.y = y;
			this.z = z;
		}
		
		return this;
	},
	
	crossProduct: function(vec3) {
		return new glacier.Vector3(
			(this.y * vec3.z) - (this.z * vec3.y),
			(this.z * vec3.x) - (this.x * vec3.z),
			(this.x * vec3.y) - (this.y * vec3.x)
		);
	},
	
	distance: function(vec3) {
		var dx = this.x - vec3.x, dy = this.y - vec3.y, dz = this.z - vec3.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x /= value.x;
			this.y /= value.y;
			this.z /= value.z;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
			this.z /= value;
		} else if(value instanceof glacier.Matrix33) {
			this.x = (this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2));
			this.y = (this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2));
			this.z = (this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.x = (this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2)) + value.element(0, 3);
			this.y = (this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2)) + value.element(1, 3);
			this.z = (this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2)) + value.element(2, 3);
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Vector3, Matrix33 or Matrix44', 'divide', 'Vector3');
		}
		
		return this;
	},
	
	dotProduct: function(vec3) {
		return ((this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z));
	},
	
	length: function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x *= value.x;
			this.y *= value.y;
			this.z *= value.z;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
			this.z *= value;
		} else if(value instanceof glacier.Matrix33) {
			this.x = (this.x * value.element(0, 0)) + (this.y * value.element(0, 1)) + (this.z * value.element(0, 2));
			this.y = (this.x * value.element(1, 0)) + (this.y * value.element(1, 1)) + (this.z * value.element(1, 2));
			this.z = (this.x * value.element(2, 0)) + (this.y * value.element(2, 1)) + (this.z * value.element(2, 2));
		} else if(value instanceof glacier.Matrix44) {
			this.x = (this.x * value.element(0, 0)) + (this.y * value.element(0, 1)) + (this.z * value.element(0, 2)) + value.element(0, 3);
			this.y = (this.x * value.element(1, 0)) + (this.y * value.element(1, 1)) + (this.z * value.element(1, 2)) + value.element(1, 3);
			this.z = (this.x * value.element(2, 0)) + (this.y * value.element(2, 1)) + (this.z * value.element(2, 2)) + value.element(2, 3);
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number, Vector3, Matrix33 or Matrix44', 'multiply', 'Vector3');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length();
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		
		return this;
	},
	
	rotateX: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotY = ((this.y * cosRad) - (this.z * sinRad));
		var rotZ = ((this.y * sinRad) + (this.z * cosRad));
		
		this.y = rotY;
		this.z = rotZ;
		
		return this;
	},
	
	rotateY: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.z * sinRad));
		var rotZ = ((this.x * sinRad) + (this.z * cosRad));
		
		this.x = rotX;
		this.z = rotZ;
		
		return this;
	},
	
	rotateZ: function(radians) {
		var cosRad = Math.cos(radians);
		var sinRad = Math.sin(radians);
		
		var rotX = ((this.x * cosRad) - (this.y * sinRad));
		var rotY = ((this.x * sinRad) + (this.y * cosRad));
		
		this.x = rotX;
		this.y = rotY;
		
		return this;
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector3) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
			this.z -= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', typeof value, 'number or Vector3', 'subtract', 'Vector3');
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ')');
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z ]);
	}
};

glacier.context.WebGL.ContextData = function(drawable, context, drawMode, shader) {
	if(!(drawable instanceof glacier.Drawable)) {
		throw new glacier.exception.InvalidParameter('drawable', typeof drawable, 'Drawable', '(constructor)', 'context.WebGL.ContextData');
	}
	
	if(!(context instanceof glacier.context.WebGL)) {
		throw new glacier.exception.InvalidParameter('context', typeof context, 'context.WebGL', '(constructor)', 'context.WebGL.ContextData');
	}
	
	var gl = context.gl, modes = [ gl.POINTS, gl.LINE_STRIP, gl.LINE_LOOP, gl.LINES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN, gl.TRIANGLES ];
	
	if(modes.indexOf(drawMode) == -1) {
		throw new glacier.exception.InvalidParameter('drawMode', drawMode, 'valid WebGL draw mode', '(constructor)', 'context.WebGL.ContextData');
	}
	
	if(!(shader instanceof glacier.context.WebGL.Shader)) {
		throw new glacier.exception.InvalidParameter('shader', typeof shader, 'context.WebGL.Shader', '(constructor)', 'context.WebGL.ContextData');
	}
	
	Object.defineProperties(this, {
		buffers:	{ value: {} },
		context:	{ value: context },
		drawMode:	{ value: drawMode },
		elements:	{ value: 0, configurable: true },
		parent:		{ value: drawable },
		textures:	{ value: [] },
		
		shader: {
			get: function() {
				return shader;
			},
			set: function(value) {
				if(value instanceof glacier.context.WebGL.Shader) {
					shader = value;
				} else if(typeof value == 'string') {
					var bankShader = context.shaderBank.shader(value);
					
					if(bankShader instanceof glacier.context.WebGL.Shader) {
						shader = bankShader;
					} else {
						console.warn('Undefined WebGL shader program: ' + value);
					}
				} else {
					throw new glacier.exception.InvalidAssignment('shader', typeof shader, 'glacier.context.WebGL.Shader', 'context.WebGL.ContextData');
				}
			}
		}
	});
};

glacier.context.WebGL.ContextData.prototype = {
	draw: function() {
		if(this.context && this.shader) {
			var f32bpe = Float32Array.BYTES_PER_ELEMENT, gl = this.context.gl, attrib, uniform, mvp;
			
			this.shader.use();
			
			if(this.buffers.vertex && (attrib = this.shader.attribute('vertex_xyz')) !== null) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
				gl.enableVertexAttribArray(attrib);
				gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.normal && (attrib = this.shader.attribute('normal_xyz')) !== null) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
				gl.enableVertexAttribArray(attrib);
				gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.texCoord && (attrib = this.shader.attribute('texture_uv')) !== null) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
				gl.enableVertexAttribArray(attrib);
				gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.color && (attrib = this.shader.attribute('color_rgba')) !== null) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
				gl.enableVertexAttribArray(attrib);
				gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);
			}
			
			this.textures.forEach(function(texture, index) {
				if(texture instanceof WebGLTexture) {
					if((uniform = this.shader.uniform('tex_samp_' + index))) {
						gl.activeTexture(gl.TEXTURE0 + index);
						gl.bindTexture(gl.TEXTURE_2D, texture);
						gl.uniform1i(uniform, index);
					}
				}
			}, this);
			
			if((uniform = this.shader.uniform('matrix_mvp'))) {
				mvp = new glacier.Matrix44(this.parent.matrix);
				
				if(this.context.projection instanceof glacier.Matrix44) {
					mvp.multiply(this.context.projection);
				}
				
				gl.uniformMatrix4fv(uniform, false, mvp.array);
			}
			
			if(this.buffers.index) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
				gl.drawElements(this.drawMode, this.elements, gl.UNSIGNED_SHORT, 0);
			} else if(this.buffers.vertex) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
				gl.drawArrays(this.drawMode, 0, this.elements);
			}
			
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	},
	init: function(vertices, indices, normals, texCoords, colors) {
		if(this.context && this.shader) {
			var gl = this.context.gl, array;
			
			if(glacier.isArray(vertices, glacier.Vector3)) {
				if(vertices.length) {
					array = [];
					vertices.forEach(function(vertex) { array.push(vertex.x, vertex.y, vertex.z); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.vertex = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
					Object.defineProperty(this, 'elements', { value: array.length / 3 });
				}
			} else if(vertices) {
				throw new glacier.exception.InvalidParameter('vertices', typeof vertices, 'Vector3 array', 'init', 'context.WebGL.ContextData');
			}
			
			if(glacier.isArray(indices, 'number')) {
				if(indices.length) {
					array = [];
					indices.forEach(function(index) { array.push(index); });
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (this.buffers.index = gl.createBuffer()));
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
					Object.defineProperty(this, 'elements', { value: array.length });
				}
			} else if(indices) {
				throw new glacier.exception.InvalidParameter('indices', typeof indices, 'number array', 'init', 'context.WebGL.ContextData');
			}
			
			if(glacier.isArray(normals, glacier.Vector3)) {
				if(normals.length) {
					array = [];
					normals.forEach(function(normal) { array.push(normal.x, normal.y, normal.z); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.normal = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(normals) {
				throw new glacier.exception.InvalidParameter('normals', typeof normals, 'Vector3 array', 'init', 'context.WebGL.ContextData');
			}
			
			if(glacier.isArray(texCoords, glacier.Vector2)) {
				if(texCoords.length) {
					array = [];
					texCoords.forEach(function(texCoord) { array.push(texCoord.u, texCoord.v); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.texCoord = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(normals) {
				throw new glacier.exception.InvalidParameter('texCoords', typeof texCoords, 'Vector2 array', 'init', 'context.WebGL.ContextData');
			}
			
			if(glacier.isArray(colors, glacier.Color)) {
				if(colors.length) {
					array = [];
					colors.forEach(function(color) { array.push(color.r / 255, color.g  / 255, color.b  / 255, color.a); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.color = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(normals) {
				throw new glacier.exception.InvalidParameter('colors', typeof colors, 'Color array', 'init', 'context.WebGL.ContextData');
			}
			
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			
			return true;
		}
		
		return false;
	},
	free: function() {
		if(this.context) {
			var gl = this.context.gl, i;
			
			for(i in this.buffers) {
				if(this.buffers.hasOwnProperty(i)) {
					gl.deleteBuffer(this.buffers[i]);
					delete this.buffers[i];
				}
			}
			
			this.textures.forEach(function(texture) {
				if(texture instanceof WebGLTexture) {
					gl.deleteTexture(texture);
				}
			});
			
			this.textures.length = 0;
		}
	}
};

glacier.context.WebGL.Shader = function(context, program) {
	if(!(context instanceof glacier.context.WebGL)) {
		throw new glacier.exception.InvalidParameter('context', typeof context, 'context.WebGL', '(constructor)', 'context.WebGL.Shader');
	}
	
	if(!(program instanceof WebGLProgram)) {
		throw new glacier.exception.InvalidParameter('program', typeof program, 'WebGLProgram', '(constructor)', 'context.WebGL.Shader');
	}
	
	Object.defineProperties(this, {
		attributes: { value: {} },
		context:	{ value: context },
		program:	{ value: program },
		uniforms:	{ value: {} }
	});
};

glacier.context.WebGL.Shader.prototype = {
	addAttributes: function(attributeArray) {
		if(glacier.isArray(attributeArray, 'string')) {
			var a;
			
			attributeArray.forEach(function(attribute) {
				if(!this.attributes.hasOwnProperty(attribute)) {
					if((a = this.context.gl.getAttribLocation(this.program, attribute)) >= 0) {
						this.attributes[attribute] = a;
					}
				}
			}, this);
		} else {
			throw new glacier.exception.InvalidParameter('attributeArray', typeof attributeArray, 'string array', 'addAttributes', 'context.WebGL.Shader');
		}
	},
	addUniforms: function(uniformArray) {
		if(glacier.isArray(uniformArray, 'string')) {
			var u;
			
			uniformArray.forEach(function(uniform) {
				if(!this.uniforms.hasOwnProperty(uniform)) {
					if((u = this.context.gl.getUniformLocation(this.program, uniform)) !== null) {
						this.uniforms[uniform] = u;
					}
				}
			}, this);
		} else {
			throw new glacier.exception.InvalidParameter('uniformArray', typeof uniformArray, 'string array', 'addUniforms', 'context.WebGL.Shader');
		}
	},
	attribute: function(attribute) {
		if(typeof attribute != 'string') {
			throw new glacier.exception.InvalidParameter('attribute', typeof attribute, 'string', 'attribute', 'context.WebGL.Shader');
		}
		
		if(typeof (attribute = this.attributes[attribute]) == 'number') {
			return (attribute >= 0 ? attribute : null);
		}
		
		return null;
	},
	uniform: function(uniform) {
		if(typeof uniform != 'string') {
			throw new glacier.exception.InvalidParameter('uniform', typeof uniform, 'string', 'uniform', 'context.WebGL.Shader');
		}
		
		if((uniform = this.uniforms[uniform]) instanceof WebGLUniformLocation) {
			return uniform;
		}
		
		return null;
	},
	use: function() {
		if(this.context && this.program) {
			this.context.gl.useProgram(this.program);
			return true;
		}
		
		return false;
	}
};

glacier.context.WebGL.ShaderBank = function(context) {
	if(!(context instanceof glacier.context.WebGL)) {
		throw new glacier.exception.InvalidParameter('context', typeof context, 'context.WebGL', '(constructor)', 'context.WebGL.ShaderBank');
	}
	
	Object.defineProperties(this, {
		context: { value: context },
		shaders: { value: {} }
	});
};

glacier.context.WebGL.ShaderBank.prototype = {
	init: function() {
		if(this.context instanceof glacier.context.WebGL) {
			var attribExpr	= /attribute\s+(?:(?:high|medium|low)p\s+)?(?:float|(?:(?:vec|mat)[234]))\s+([a-zA-Z_]+[a-zA-Z0-9_]*)\s*;/g,
				uniformExpr	= /uniform\s+(?:(?:high|medium|low)p\s+)?(?:bool|int|float|(?:(?:vec|bvec|ivec|mat)[234])|(?:sampler(?:Cube|2D)))\s+([a-zA-Z_]+[a-zA-Z0-9_]*)(\[(?:(?:\d+)|(?:[a-zA-Z_]+[a-zA-Z0-9_]*))\])?\s*;/g,
				vertShaders = {}, fragShaders = {}, gl = this.context.gl, shaderMap = glacier.context.WebGL.shaders, s, v, f, p, src, match, obj, vert, frag, prog;
				
			for(v in shaderMap.vertex) {
				if(shaderMap.vertex[v] instanceof Array) {
					src = shaderMap.vertex[v].join('\n');
					obj = { attributes: [], uniforms: [] };
					
					while((match = attribExpr.exec(src))) {
						obj.attributes.push(match[1]);
					}
					
					while((match = uniformExpr.exec(src))) {
						obj.uniforms.push(match[1]);
					}
					
					if((obj.shader = this.context.createShader(gl.VERTEX_SHADER, src))) {
						vertShaders[v] = obj;
					}
				}
			}
			
			for(f in shaderMap.fragment) {
				if(shaderMap.fragment[f] instanceof Array) {
					src = shaderMap.fragment[f].join('\n');
					obj = { uniforms: [] };
					
					while((match = uniformExpr.exec(src))) {
						obj.uniforms.push(match[1]);
					}
					
					if((obj.shader = this.context.createShader(gl.FRAGMENT_SHADER, src))) {
						fragShaders[f] = obj;
					}
				}
			}
			
			for(p in shaderMap.programs) {
				if(shaderMap.programs.hasOwnProperty(p)) {
					v = vertShaders[shaderMap.programs[p].vertex];
					f = fragShaders[shaderMap.programs[p].fragment];
					
					if(v && f && (vert = v.shader) && (frag = f.shader)) {
						if((prog = this.context.createProgram(vert, frag))) {
							var shader = new glacier.context.WebGL.Shader(this.context, prog);
							
							shader.addAttributes(v.attributes);
							shader.addUniforms(v.uniforms);
							shader.addUniforms(f.uniforms);
							
							this.shaders[p] = shader;
						}
					}
				}
			}
			
			return true;
		}
			
		return false;
	},
	shader: function(shader) {
		if(typeof shader != 'string') {
			throw new glacier.exception.InvalidParameter('shader', typeof shader, 'string', 'shader', 'context.WebGL.ShaderBank');
		}
		
		if((shader = this.shaders[shader]) instanceof glacier.context.WebGL.Shader) {
			return shader;
		}
		
		return null;
	}
};

glacier.context.WebGL.shaders = {
	vertex: {
		generic: [
			'attribute highp vec3 vertex_xyz;',
			'attribute highp vec3 normal_xyz;',
			'attribute highp vec2 texture_uv;',
			'attribute highp vec4 color_rgba;',
			'uniform highp mat4 matrix_mvp;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'gl_PointSize = 2.0;',
				'gl_Position = matrix_mvp * vec4(vertex_xyz, 1.0);',
				'tex_coords = texture_uv; frag_color = color_rgba;',
				'mvp_normal = normalize(matrix_mvp * vec4(normal_xyz, 1.0)).xyz;',
			'}'
		]
	},
	fragment: {
		generic: [
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = frag_color;',
			'}'
		],
		globe: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'uniform sampler2D tex_samp_2;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(-28.0, 2.0, 12.0));',
				'vec3 normal = normalize(texture2D(tex_samp_2, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(mvp_normal, lightPos), 0.0);',
				'vec3 dayColor = texture2D(tex_samp_0, tex_coords).rgb * diffuse;',
				'vec3 nightColor = texture2D(tex_samp_1, tex_coords).rgb * (1.0 - diffuse);',
				'gl_FragColor = vec4(nightColor + dayColor * max(dot(normal, lightPos), 0.3), 1.0);',
			'}'
		],
		normalMapped: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(1.0, 1.0, 1.0));',
				'vec4 fragColor = vec4(1.0, 1.0, 1.0, 1.0);',
				'vec3 normal = normalize(texture2D(tex_samp_1, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(normal, lightPos), 0.0);',
				'gl_FragColor = vec4(diffuse * texture2D(tex_samp_0, tex_coords).rgb, 1.0);',
			'}'
		],
		textured: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = texture2D(tex_samp_0, tex_coords);',
			'}'
		]
	},
	programs: {
		generic: { vertex: 'generic', fragment: 'generic' },
		globe: { vertex: 'generic', fragment: 'globe' },
		normalMapped: { vertex: 'generic', fragment: 'normalMapped' },
		textured: { vertex: 'generic', fragment: 'textured' }
	}
};

glacier.Sphere = function Sphere(latitudes, longitudes, radius) {
	// Call super constructor
	glacier.Mesh.call(this);
	
	// Ensure that radius is a positive number
	radius = (typeof radius == 'number' && radius >= 0.0 ? radius : 0.0);
	
	// Define getter and setter for radius member
	Object.defineProperty(this, 'radius', {
		get: function() {
			return radius;
		},
		set: function(value) {
			if(typeof value == 'number' && value >= 0.0) {
				
				if(value > 0.0) {
					this.vertices.forEach(function(vertex) {
						vertex = (vertex / radius) * value;
					});
				} else if(this.indices.length) {
					this.free();
				}
				
				radius = value;
			} else {
				throw new glacier.exception.InvalidAssignment('radius', value, 'positive number', 'Sphere');
			}
		}
	});
	
	// Generate sphere is latitudes and longitudes are set
	if(latitudes && longitudes) {
		this.generate(latitudes, longitudes, radius || 1.0);
	}
};

glacier.extend(glacier.Sphere, glacier.Mesh, {
	// Overloaded members
	free: function() {
		glacier.Mesh.prototype.free.call(this);
		this.radius = 0.0;
	},
	
	// Unique members
	generate: function(latitudes, longitudes, radius) {
		// Validate latitudes parameter
		if(typeof latitudes != 'number' || latitudes < 3) {
			throw new glacier.exception.InvalidParameter('latitudes', latitudes, 'number (>= 3)', 'generate', 'Sphere');
		} else latitudes = Math.round(Math.abs(latitudes));
		
		// Validate longitudes parameter
		if(typeof longitudes != 'number' || longitudes < 3) {
			throw new glacier.exception.InvalidParameter('longitudes', longitudes, 'number (>= 3)', 'generate', 'Sphere');
		} else longitudes = Math.round(Math.abs(longitudes));
		
		// Validate radius parameter
		if(radius === undefined) {
			radius = 1.0;
		} else if(typeof radius != 'number' || radius <= 0.0) {
			throw new glacier.exception.InvalidParameter('radius', radius, 'number (> 0.0)', 'generate', 'Sphere');
		}
		
		this.free();
		this.radius = radius;
		
		var lat, lng, theta, sinTheta, cosTheta, phi, sinPhi, cosPhi, x, y, z, u, v;
		
		for(lat = 0; lat <= latitudes; ++lat) {
			theta = lat * Math.PI / latitudes;
			sinTheta = Math.sin(theta);
			cosTheta = Math.cos(theta);
			
			for(lng = 0; lng <= longitudes; ++lng) {
				phi = lng * 2 * Math.PI / longitudes;
				sinPhi = Math.sin(phi);
				cosPhi = Math.cos(phi);
				
				x = cosPhi * sinTheta;
				y = cosTheta;
				z = sinPhi * sinTheta;
				u = 1 - (lng / longitudes);
				v = (lat / latitudes);
				
				this.vertices.push(new glacier.Vector3(radius * x, radius * y, radius * z));
				this.normals.push(new glacier.Vector3(x, y, z));
				this.texCoords.push(new glacier.Vector2(u, v));
			}
		}
		
		for(lat = 0; lat < latitudes; ++lat) {
			for(lng = 0; lng < longitudes; ++lng) {
				x = (lat * (longitudes + 1)) + lng;
				y = x + longitudes + 1;
				
				this.indices.push(x, y, x + 1);
				this.indices.push(y, y + 1, x + 1);
			}
		}
		
		return true;
	}
});
