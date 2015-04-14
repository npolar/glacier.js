var glacier = {};

(function(glacier) {
	var lang;
	
	Object.defineProperties(glacier, {
		VERSION: {
			value: '0.0.4',
			writable: false
		},
		language: {
			get: function() { return lang; },
			set: function(language) {
				if(glacier.i18n[language]) {
					lang = language;
				} else {
					var fallback = (glacier.i18n.alias[language] ? glacier.i18n.alias[language][0] : null);
					lang = (glacier.i18n[fallback] ? fallback : 'en');
					
					glacier.warn('UNDEFINED_LANGUAGE', { language: language, fallback: lang });
				}
			}
		}
	});
	
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
	
	glacier.log = function(message, type, params) {
		var msg = glacier.i18n(message), match;
		
		if(!msg) {
			if(type == 'warning') {
				msg = glacier.i18n('UNDEFINED_WARNING');
				params = { warning: message };
			} else if(type == 'error') {
				msg = glacier.i18n('UNDEFINED_ERROR');
				params = { error: message };
			}
		}
		
		if(typeof params == 'object' && (match = msg.match(/\{[^\}]*\}/g))) {
			for(var m in match) {
				var param = match[m].substr(1, match[m].length - 2);
				
				if(params.hasOwnProperty(param)) {
					msg = msg.replace(match[m], params[param]);
				}
			}
		}
		
		switch(type) {
			case 'error':
				console.error(msg);
				break;
			
			case 'warning':
				console.warn(msg);
				break;
			
			default:
				console.log(message);
		}
	};
	
	glacier.error = function(message, params) {
		glacier.log(message, 'error', params);
	};
	
	glacier.warn = function(message, params) {
		glacier.log(message, 'warning', params);
	};
	
	glacier.isArray = function(value, prototypeCheck) {
		var arr;
		
		[ Array, Int8Array, Int16Array, Int32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Float32Array, Float64Array ].forEach(function(type) {
			if(!arr && value instanceof type) {
				arr = true;
			}
		});
		
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
	
	glacier.union = function(members, value) {
		members = (members instanceof Array ? members : [ members ]);
		
		function addProperty(index) {
			Object.defineProperty(this, members[index], {
				get: function() { return value; },
				set: function(val) {
					if(typeof val == typeof value) {
						value = val;
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: members[index], value: typeof val, expected: typeof value });
					}
				}
			});
		}
		
		for(var m in members) {
			addProperty.call(this, m);
		}
	};
	
	if(typeof module == 'object') {
		module.exports = glacier;
	}
})(glacier);

glacier.Camera = function(verticalViewAngle, aspectRatio) {
	var args = [ 'verticalViewAngle', 'aspectRatio' ], error;
	
	Object.defineProperties(this, {
		aspectRatio: {
			get: function() {
				return aspectRatio;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0.0) {
					aspectRatio = value;
					update();
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Camera.aspectRatio', value: value, expected: 'positive number' });
				}
			}
		},
		
		fieldOfView: {
			get: function() {
				return verticalViewAngle;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0.0) {
					verticalViewAngle = value;
					update();
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'camera.fieldOfView', value: value, expected: 'positive number' });
				}
			}
		},
		
		matrix: {
			value: new glacier.Matrix44(),
			writable: false
		},
		
		position: {
			value: new glacier.Vector3(0, 1, 1),
			writable: false
		},
		
		target: {
			value: new glacier.Vector3(0, 0, 0),
			writable: false
		}
	});
	
	[ verticalViewAngle, aspectRatio ].forEach(function(arg, index) {
		if(typeof arg != 'number' || arg <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'positive number', method: 'Camera constructor' });
			error = true;
		}
	});
	
	if(error) {
		verticalViewAngle = (typeof verticalViewAngle == 'number' && verticalViewAngle > 0.0 ? verticalViewAngle : 60.0);
		aspectRatio = (typeof aspectRatio == 'number' && aspectRatio > 0.0 ? aspectRatio : 16 / 9);
	}
	
	this.update();
};

glacier.Camera.prototype = {
	follow: function(target, angle, distance) {
		if(!(target instanceof glacier.Vector3)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'target', value: typeof target, expected: 'Vector3', method: 'Camera.follow' });
			return;
		}
		
		if(!(angle instanceof glacier.Vector2)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'angle', value: typeof angle, expected: 'Vector2', method: 'Camera.follow' });
			return;
		}
		
		if(typeof distance != 'number' || distance <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'distance', value: typeof distance, expected: 'positive number', method: 'Camera.follow' });
			return;
		}
		
		var ver = {}, hor = {}, dir = new glacier.Vector2(glacier.limitAngle(angle.x), glacier.limitAngle(angle.y));
		
		ver.hyp = distance;
		ver.opp = ver.hyp * Math.sin(glacier.degToRad(dir.y));
		ver.adj = ver.hyp * Math.cos(glacier.degToRad(dir.y));
		
		hor.hyp = ver.adj;
		hor.opp = hor.hyp * Math.sin(glacier.degToRad(dir.x));
		hor.adj = hor.hyp * Math.cos(glacier.degToRad(dir.x));
		
		this.target	= target;
		
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
		
		// TODO: Remove hard-coded clipping planes
		this.matrix.assign(new glacier.Matrix44());
		this.matrix.perspective(this.fieldOfView, this.aspectRatio, 0.1, 100.0);
		//this.matrix.ortho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
		
		this.matrix.assign(new glacier.Matrix44([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).multiply(this.matrix)).translate(-this.position.x, -this.position.y, -this.position.z);
	}
};

glacier.Color = function(params) {
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
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.r', value: red, expected: 'number between 0 and 255' });
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
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.g', value: green, expected: 'number between 0 and 255' });
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
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.b', value: blue, expected: 'number between 0 and 255' });
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
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.a', value: alpha, expected: 'number between 0.0 and 1.0' });
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
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.rgb', value: '[' + rgb.join(', ') + ']', expected: 'array[3] of numbers between 0.0 and 1.0' });
					}
				} else {
					rgb = (typeof rgb == 'number' ? '0x' + rgb.toString(16).toUpperCase() : rgb);
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.rgb', value: rgb, expected: 'RGB as 24-bits integer or array[3] of numbers between 0.0 and 1.0' });
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
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.rgba', value: '[' + rgba.join(', ') + ']', expected: 'array[4] of numbers between 0.0 and 1.0' });
					}					
				} else {
					rgba = (typeof rgba == 'number' ? '0x' + rgba.toString(16).toUpperCase() : rgba);
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Color.rgba', value: rgba, expected: 'RGBA as 32-bits integer or array[4] of numbers between 0.0 and 1.0' });
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
				if(typeof args[a] != 'number') {
					glacier.error('INVALID_PARAMETER', { parameter: args[a], expected: 'number', method: 'Color constructor' });
					return;
				} else vals.push(args[a] / (a < 3 ? 255 : 1));
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
	toArray: function() {
		return new Float32Array([ this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a ]);
	},
	
	toString: function() {
		return ('rgba(' + [ this.r, this.g, this.b, this.a.toFixed(2) ].join(', ') + ')');
	}
};

// Pre-defined colors
glacier.color = {};
Object.defineProperties(glacier.color, {
	WHITE:		{ get: function() { return new glacier.Color(0xFFFFFF, 1.0); } },
	SILVER:		{ get: function() { return new glacier.Color(0xC0C0C0, 1.0); } },
	GRAY:		{ get: function() { return new glacier.Color(0x808080, 1.0); } },
	BLACK:		{ get: function() { return new glacier.Color(0x000000, 1.0); } },
	RED:		{ get: function() { return new glacier.Color(0xFF0000, 1.0); } },
	MAROON:		{ get: function() { return new glacier.Color(0x800000, 1.0); } },
	YELLOW:		{ get: function() { return new glacier.Color(0xFFFF00, 1.0); } },
	OLIVE:		{ get: function() { return new glacier.Color(0x808000, 1.0); } },
	LIME:		{ get: function() { return new glacier.Color(0x00FF00, 1.0); } },
	GREEN:		{ get: function() { return new glacier.Color(0x008000, 1.0); } },
	AQUA:		{ get: function() { return new glacier.Color(0x00FFFF, 1.0); } },
	TEAL:		{ get: function() { return new glacier.Color(0x008080, 1.0); } },
	BLUE:		{ get: function() { return new glacier.Color(0x0000FF, 1.0); } },
	NAVY:		{ get: function() { return new glacier.Color(0x000080, 1.0); } },
	FUCHSIA:	{ get: function() { return new glacier.Color(0xFF00FF, 1.0); } },
	PURPLE:		{ get: function() { return new glacier.Color(0x800080, 1.0); } }
});

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

glacier.Mesh = function(context) {
};

glacier.Mesh.prototype = {
	generateSphere: function(latitudes, longitudes, radius) {
		var sphere = new glacier.Sphere(latitudes, longitudes, radius);
		
		if(sphere.radius) {
			this.indices = sphere.indices;
			this.normals = sphere.normals;
			this.uvCoords = sphere.uvCoords;
			this.vertices = sphere.vertices;
			return true;
		}
		
		return false;
	}
};

'indices,normals,uvCoords,vertices'.split(',').forEach(function(property, index) {
	var a, array = [];
	
	Object.defineProperty(glacier.Mesh.prototype, property, {
		get: function() {
			return array;
		},
		set: function(value) {
			if(glacier.isArray(value)) {
				for(a = 0; a < value.length; ++a) {
					array.push(value[a]);
				}
			} else {
				glacier.error('INVALID_ASSIGNMENT', { variable: 'Mesh.' + property, value: typeof value, expected: 'array' });
			}
		}
	});
});

glacier.i18n = function(code, language) {
	language = (language || glacier.language);
	
	if(glacier.i18n[language] && glacier.i18n[language][code]) {
		return glacier.i18n[language][code];
	} else if(glacier.i18n.alias[language]) {
		for(var a in glacier.i18n.alias[language]) {
			var alias = glacier.i18n.alias[language][a];
			
			if(glacier.i18n[alias] && glacier.i18n[alias][code]) {
				return glacier.i18n[alias][code];
			}
		}
	}
	
	// Use English (en) as secondary fallback
	return (glacier.i18n.en[code] || null);
};

// Primary fallback aliases
glacier.i18n.alias = {
	no: [ 'nb', 'nn' ],
	nb: [ 'nn' ],
	nn: [ 'nb' ]
};

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
	if(typeof degrees == 'number') {
		return (degrees * Math.PI / 180.0);
	}
	
	glacier.error('INVALID_PARAMETER', { parameter: 'degrees', value: typeof degrees, expected: 'number', method: 'degToRad' });
	return degrees;
};

glacier.radToDeg = function(radians) {
	if(typeof radians == 'number') {
		return (radians * 180.0 / Math.PI);
	}
	
	glacier.error('INVALID_PARAMETER', { parameter: 'radians', value: typeof radians, expected: 'number', method: 'radToDeg' });
	return radians;	
};

glacier.limitAngle = function(angle, max, min) {
	if(typeof angle != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'angle', value: typeof angle, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(typeof (max = (max === undefined ? 360.0 : max)) != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'max', value: typeof max, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(typeof (min = (min === undefined ? 0.0 : min)) != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'min', value: typeof min, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	while(angle > max) angle -= max;
	while(angle < min) angle += max;
	
	return angle;
};

glacier.clamp = function(value, min, max) {
	var args = [ 'value', 'min', 'max' ], error;
	[ value, min, max ].forEach(function(arg, index) {
		if(typeof arg != 'number') {
			glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'clamp' });
			error = true;
		}
	});
	
	if(!error) {
		if(max < min) {
			max = min + (min = max, 0);
		}
		
		return Math.max(min, Math.min(max, value));
	}

	return null;
};

glacier.context.WebGL = function(options) {
	options = (typeof options == 'object' ? options : {});
	
	var background, canvas, container, context;
	
	if(options.container instanceof HTMLElement) {
		container = options.container;
	} else if(typeof options.container == 'string') {
		if(!(container = document.getElementById(options.container))) {
			glacier.error('UNDEFINED_ELEMENT', { element: options.container, method: 'context.WebGL constructor' });
		}
	} else {
		glacier.error('MISSING_PARAMETER', { parameter: 'container', method: 'context.WebGL constructor' });
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
		Object.defineProperty(this, 'canvas', {
			value: canvas,
			writable: false
		});
		
		Object.defineProperties(this, {
			canvas: {
				value: canvas,
				writable: false
			},
			width: {
				get: function() {
					return this.canvas.width;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						this.resize(value, height);
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.width', value: value, expected: 'positive number' });
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
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.height', value: value, expected: 'positive number' });
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
			Object.defineProperty(this, 'gl', {
				value: context,
				writable: false
			});
		}
		
		if(this.gl) {
			Object.defineProperty(this, 'background', {
				get: function() {
					return background;
				},
				set: function(color) {
					if(color instanceof glacier.Color) {
						background = color;
						this.gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a);
						this.gl.clear(this.gl.COLOR_BUFFER_BIT);
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.background', value: typeof color, expected: 'Color' });
					}
				}
			});
			
			this.background = glacier.color.BLACK;
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
	resize:	function(width, height) {
		if(typeof width != 'number' || width <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'width', value: typeof width, expected: 'positive number', method: 'Context.resize' });
			return;
		}
		
		if(typeof height != 'number' || height <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'height', value: typeof height, expected: 'positive number', method: 'Context.resize' });
			return;
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
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: 'uninitialized context' });
			return null;
		}
		
		if(!(vertShader instanceof WebGLShader)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'vertShader', value: typeof vertShader, expected: 'WebGLShader', method: 'context.WebGL.createProgram' });
			return null;
		}
		
		if(!(fragShader instanceof WebGLShader)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'fragShader', value: typeof fragShader, expected: 'WebGLShader', method: 'context.WebGL.createProgram' });
			return null;
		}
		
		var program = this.gl.createProgram();
		this.gl.attachShader(program, vertShader);
		this.gl.attachShader(program, fragShader);
		this.gl.linkProgram(program);
		
		if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: this.gl.getProgramInfoLog(program) });
			return null;
		}
		
		return program;
	},
	createShader: function(type, source) {
		if(!this.gl) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: 'uninitialized context' });
			return null;
		}
		
		var last, shader, valid = [ this.gl.FRAGMENT_SHADER, this.gl.VERTEX_SHADER ];
		
		if(typeof source != 'string') {
			glacier.error('INVALID_PARAMETER', { parameter: 'source', value: typeof source, expected: 'string', method: 'context.WebGL.createShader' });
			return null;
		}
		
		if(valid.indexOf(type) == -1) {
			last = (valid = valid.join(', ')).lastIndexOf(', ');
			valid = (last >= 0 ? valid.substr(0, last) + ' or' + valid.substr(last + 1) : valid);
			glacier.error('INVALID_PARAMETER', { parameter: 'type', value: type, expected: valid, method: 'context.WebGL.createShader' });
			return null;
		}
		
		shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		
		if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: this.gl.getShaderInfoLog(shader) });
			return null;
		}
		
		return shader;
	}
});

glacier.Sphere = function(latitudes, longitudes, radius) {
	radius = (typeof radius == 'number' && radius >= 0.0 ? radius : 0.0);
	
	Object.defineProperties(this, {
		indices: {
			value: [],
			writable: false
		},
		normals: {
			value: [],
			writable: false
		},
		radius: {
			get: function() {
				return radius;
			},
			set: function(value) {
				if(typeof value == 'number' && value >= 0.0) {
					
					if(value > 0.0) {
						this.vertices.forEach(function(vertex) {
							vertex = (vertex / radius) * value;
						});
					} if(this.indices.length) {
						this.destroy();
					}
					
					radius = value;
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Sphere.radius', value: value, expected: 'positive number' });
				}
			}
		},
		uvCoords: {
			value: [],
			writable: false
		},
		vertices: {
			value: [],
			writable: false
		}
	});
	
	if(latitudes && longitudes) {
		this.generate(latitudes, longitudes, radius || 1.0);
	}
};

glacier.Sphere.prototype = {
	destroy: function() {
		this.indices.length = 0;
		this.normals.length = 0;
		this.uvCoords.length = 0;
		this.vertices.length = 0;
		this.radius = 0.0;
	},
	generate: function(latitudes, longitudes, radius) {
		// Validate latitudes parameter
		if(typeof latitudes != 'number' || latitudes < 3) {
			glacier.error('INVALID_PARAMETER', { parameter: 'latitudes', value: latitudes, expected: 'number (>= 3)', method: 'Sphere.generate' });
			return false;
		} else latitudes = Math.round(Math.abs(latitudes));
		
		// Validate longitudes parameter
		if(typeof longitudes != 'number' || longitudes < 3) {
			glacier.error('INVALID_PARAMETER', { parameter: 'longitudes', value: longitudes, expected: 'number (>= 3)', method: 'Sphere.generate' });
			return false;
		} else longitudes = Math.round(Math.abs(longitudes));
		
		// Validate radius parameter
		if(radius === undefined) {
			radius = 1.0;
		} else if(typeof radius != 'number' || radius <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'radius', value: radius, expected: 'number (> 0.0)', method: 'Sphere.generate' });
			return false;
		}
		
		this.destroy();
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
				
				this.vertices.push(radius * x, radius * y, radius * z);
				this.normals.push(x, y, z);
				this.uvCoords.push(u, v);
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
};

glacier.Matrix33 = function(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]),
		writable: false
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33, Matrix44 or array[9]', method: 'Matrix33.assign' });
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
		
		glacier.error('INDEX_OUT_OF_RANGE', { index: (colOrIndex + (row || 0)), range: '0-9', method: 'Matrix33.element' });
		return undefined;
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33 or Matrix44', method: 'Matrix33.multiply' });
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
			glacier.error('MATRIX_NO_INVERSE', { matrix: temp.toString(), method: 'Matrix33.inverse' });
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

glacier.Matrix44 = function(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ]),
		writable: false
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33, Matrix44 or array[16]', method: 'Matrix44.assign' });
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
		
		glacier.error('INDEX_OUT_OF_RANGE', { index: (colOrIndex + (row || 0)), range: '0-16', method: 'Matrix44.element' });
		return undefined;
	},
	
	frustum: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(','), error, dX, dY, dZ;
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.frustum' });
				error = true;
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(error || near <= 0.0 || far <= 0.0 || (dX = right - left) <= 0.0 || (dY = top - bottom) <= 0.0 || (dZ = far - near) <= 0.0) {
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
			glacier.error('MATRIX_NO_INVERSE', { matrix: temp.toString(), method: 'Matrix44.inverse' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Matrix33 or Matrix44', method: 'Matrix44.multiply' });
		}
		
		return this;
	},
	
	ortho: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(','), error;
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.ortho' });
				error = true;
			}
		});
		
		// Ensure all arguments are numbers in valid ranges
		if(error || !(dX = right - left) || !(dY = top - bottom) || !(dZ = far - near)) {
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
		var args = 'verticalViewAngle,aspectRatio,near,far'.split(','), error, height, width, temp = new glacier.Matrix44();
		
		[ verticalViewAngle, aspectRatio, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.perspective' });
				error = true;
			}
		});
		
		if(error || near <= 0.0 || far <= 0.0) {
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
			glacier.error('INVALID_PARAMETER', { parameter: 'radians', value: typeof radians, expected: 'number', method: 'Matrix44.rotate' });
		} else if(xOrVec3 instanceof glacier.Vector3) {
			return this.rotate(radians, xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], error, x = xOrVec3, cosRad, sinRad, mag, oneMinusCos;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.rotate' });
					error = true;
				}
			});
			
			if(!error) {
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
		}
		
		return this;
	},
	
	scale: function(xOrVec3, y, z) {
		if(xOrVec3 instanceof glacier.Vector3) {
			return this.scale(xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], error, x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.scale' });
					error = true;
				}
			});
			
			if(!error) {
				this.array[ 0] *= x; this.array[ 4] *= y; this.array[ 8] *= z;
				this.array[ 1] *= x; this.array[ 5] *= y; this.array[ 9] *= z;
				this.array[ 2] *= x; this.array[ 6] *= y; this.array[10] *= z;
				this.array[ 3] *= x; this.array[ 7] *= y; this.array[11] *= z;
			}
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
			var args = [ 'x', 'y', 'z' ], error, x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Matrix44.translate' });
					error = true;
				}
			});
			
			if(!error) {
				this.array[12] += (this.array[ 0] * x + this.array[ 4] * y + this.array[ 8] * z);
				this.array[13] += (this.array[ 1] * x + this.array[ 5] * y + this.array[ 9] * z);
				this.array[14] += (this.array[ 2] * x + this.array[ 6] * y + this.array[10] * z);
				this.array[15] += (this.array[ 3] * x + this.array[ 7] * y + this.array[11] * z);
			}
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

glacier.Vector2 = function(x, y) {
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	
	Object.defineProperty(this, 'array', {
		get: function() { return new Float32Array([ this.x, this.y ]); },
		set: function() {}
	});
	
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector2', method: 'Vector2.add' });
		}
		
		return this;
	},
	
	assign: function(xOrVec2, y) {
		if(xOrVec2 instanceof glacier.Vector2) {
			return this.assign(xOrVec2.x, xOrVec2.y);
		} else {
			var args = [ 'x', 'y' ], error, x = xOrVec2;
			
			[ x, y ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					glaicer.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Vector2.assign' });
					error = true;
				}
			});
			
			if(!error) {
				this.x = x;
				this.y = y;
			}
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector2', method: 'Vector2.divide' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector2', method: 'Vector2.multiply' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector2', method: 'Vector2.subtract' });
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	}
};

glacier.Vector3 = function(x, y, z) {
	glacier.union.call(this, ['x', 'u'], (typeof x == 'number' ? x : 0.0));
	glacier.union.call(this, ['y', 'v'], (typeof y == 'number' ? y : 0.0));
	glacier.union.call(this, ['z', 'w'], (typeof z == 'number' ? z : 0.0));
	
	Object.defineProperty(this, 'array', {
		get: function() { return new Float32Array([ this.x, this.y, this.z ]); },
		set: function() {}
	});
	
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector3', method: 'Vector3.add' });
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
			var args = [ 'x', 'y', 'z' ], error, x = xOrVec3;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					glaicer.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'Vector3.assign' });
					error = true;
				}
			});
			
			if(!error) {
				this.x = x;
				this.y = y;
				this.z = z;
			}
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Vector3, Matrix33 or Matrix44', method: 'Vector3.divide' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number, Vector3, Matrix33 or Matrix44', method: 'Vector3.multiply' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'value', value: typeof value, expected: 'number or Vector3', method: 'Vector3.subtract' });
		}
		
		return this;
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ')');
	}
};

glacier.i18n.en = {
	CONTEXT_ERROR:			'{context} context error: {error}',
	INDEX_OUT_OF_RANGE:		'Index out of range: {index} (expected range {range}) in {method}',
	INVALID_ASSIGNMENT:		'Invalid assigment of {variable}: {value} (expected {expected})',
	INVALID_PARAMETER:		'Invalid parameter {parameter}: {value} (expected {expected}) in {method}',
	MATRIX_NO_INVERSE:		'Inverse matrix does not exist: {matrix} in {method}',
	MISSING_IMPLEMENTATION:	'Missing implementation: {implementation} in {child} extension of {parent}',
	MISSING_PARAMETER:		'Missing mandatory parameter: {parameter} in {method}',
	UNDEFINED_ELEMENT:		'Undefined element ID: {element} in {method}',
	UNDEFINED_ERROR:		'Undefined error: {error}',
	UNDEFINED_WARNING:		'Undefined warning: {warning}',
	UNDEFINED_LANGUAGE:		'Undefined language: {language} (using {fallback} as fallback)',
	UNKNOWN_PROPERTY:		'Unrecognized property: {property} in {object}'
};

glacier.i18n.nb = {
	CONTEXT_ERROR:			'{context} kontekstfeil: {error}',
	INDEX_OUT_OF_RANGE:		'Index out of range: {index} (expected range {range}) in {method}',
	INVALID_ASSIGNMENT:		'Ugyldig tildeing av {variable}: {value} (forventet {expected})',
	INVALID_PARAMETER:		'Ugyldig parameter {parameter}: {value} (forventet {expected}) i {method}',
	MATRIX_NO_INVERSE:		'Invers matrise eksisterer ikke: {matrix} i {method}',
	MISSING_IMPLEMENTATION:	'Mangler implementasjon: {implementation} i {child} utvidelse av {parent}',
	MISSING_PARAMETER:		'Mangler obligatorisk parameter: {parameter} i {method}',
	UNDEFINED_ELEMENT:		'Udefinert element ID: {element} i {method}',
	UNDEFINED_ERROR:		'Udefinert feilmelding: {error}',
	UNDEFINED_WARNING:		'Udefinert advarsel: {warning}',
	UNDEFINED_LANGUAGE:		'Udefinert språkkode: {language} (bruker {fallback})',
	UNKNOWN_PROPERTY:		'Ukjent egenskap: {property} i {object}'
};
