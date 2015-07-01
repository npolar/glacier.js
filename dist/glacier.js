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
	VERSION: '0.2.12',
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

glacier.extend = function(target, source) {
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

glacier.addTypedProperty = function(context, members, value, ctor) {
	members = (members instanceof Array ? members : [ members ]);
	
	var m, onChangeCallback;
	
	function typedProperty(member) {
		Object.defineProperty(context, member, {
			get: function() {
				return value;
			},
			set: function(newValue) {
				if(typeof ctor == 'function' && !(newValue instanceof ctor)) {
					glacier.error.invalidAssignment(member, newValue, ctor.name);
				} else if(typeof newValue !== typeof value) {
					glacier.error.invalidAssignment(member, newValue, typeof value);
				} else if(newValue !== value) {
					value = newValue;
					
					if(onChangeCallback) {
						onChangeCallback(value);
					}
				}
			}
		});
	}
	
	for(m in members) {
		typedProperty(members[m]);
	}
	
	return {
		onChange: function(callback) {
			if(typeof callback == 'function') {
				onChangeCallback = callback;
			} else {
				throw new glacier.exception.InvalidParameter('callback', callback, 'function', 'onChange');
			}
		}
	};
};

glacier.parseOptions = function(options, defaults, className) {
	var d, o, result = {}, reserved = 'gt,lt,class,not'.split(','), type;
	
	function getDefault(object) {
		if(object instanceof Array) {
			if(object[0] !== undefined && object[0] !== null) {
				if(typeof object[0] == 'object') {
					return getDefault(object[0]);
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
			var r, valid = [], last, o, v;
			
			for(r in rules) {
				if(rules[r] === null) {
					valid.push('null');
					
					if(value === null || value === undefined) {
						return value;
					}
				} else if(typeof rules[r] == 'object') {
					for(o in rules[r]) {
						if(rules[r].hasOwnProperty(o) && reserved.indexOf(o) == -1) {
							valid.push(o);
							
							if((v = getOverride(rules[r])) !== null) {
								return v;
							}
						}
					}
				} else if(typeof rules[r] == 'string') {
					valid.push(rules[r]);
					
					if(typeof value == rules[r]) {
						return value;
					}
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
		throw new glacier.exception.InvalidParameter('options', defaults, 'object', 'parseOptions');
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
		throw new glacier.exception.InvalidParameter('defaults', defaults, 'object', 'parseOptions');
	}
	
	return result;
};

glacier.error = {
	invalidAssignment: function(property, value, expected, className) {
		console.error('Invalid assignment of ' + (className ? className + '.' : '') + property + ': ' + value + ' (' + typeof value + '), ' + 'expected ' + expected);
	}
};

(function() {
	var uids = [], chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	
	function generateUID() {
		var c, uid = '';
		
		for(c = 0; c < 32; ++c) {
			uid += chars[Math.floor(Math.random() * chars.length)];
		}
		
		if(uids.indexOf(uid) == -1) {
			uids.push(uid);
			return uid;
		}
		
		return generateUID();
	}
	
	glacier.generateUID = generateUID;
})();

glacier.BufferObject = function BufferObject(drawable, context, shader) {
	// Ensure that drawable is a valid Drawable object
	if(!(drawable instanceof glacier.Drawable)) {
		throw new glacier.exception.InvalidParameter('drawable', drawable, 'Drawable', '(constructor)', 'BufferObject');
	}
	
	// Ensure that context is a valid Context object
	if(!(context instanceof glacier.Context)) {
		throw new glacier.exception.InvalidParameter('context', context, 'Context', '(constructor)', 'BufferObject');
	}
	
	// Ensure that shader is a valid Shader object
	if(!(shader instanceof glacier.Shader)) {
		throw new glacier.exception.InvalidParameter('shader', shader, 'Shader', '(constructor)', 'BufferObject');
	}
	
	var gl = context.gl, modes = [ gl.POINTS, gl.LINE_STRIP, gl.LINE_LOOP, gl.LINES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN, gl.TRIANGLES ], mode = 0, elements = 0;
	
	// Define buffers, context, parent, textures, elements, drawMode and shader memebers
	Object.defineProperties(this, {
		color:		{ value: glacier.color.WHITE },
		buffers:	{ value: {} },
		context:	{ value: context },
		parent:		{ value: drawable },
		textures:	{ value: [] },
		
		elements: {
			get: function() {
				return elements;
			},
			set: function(value) {
				if(typeof value == 'number' && value >= 0) {
					elements = Math.round(value);
				} else {
					glacier.error.invalidAssignment('elements', value, 'positive integer', 'BufferObject');
				}
			}
		},
		
		drawMode: {
			get: function() {
				return mode;
			},
			set: function(value) {
				if(modes.indexOf(value) != -1) {
					mode = value;
				} else {
					modes.sort(function(a, b) { return a-b; });
					var valid = modes.join(', '), last = valid.lastIndexOf(', ');
					valid = (last >= 0 ? valid.substr(0, last) + ' or' + valid.substr(last + 1) : valid);
					glacier.error.invalidAssignment('drawMode', value, valid, 'BufferObject');
				}
			}
		},
		
		shader: {
			get: function() {
				return shader;
			},
			set: function(value) {
				if(value instanceof glacier.Shader) {
					shader = value;
				} else if(typeof value == 'string') {
					var bankShader = context.shaders.get(value);
					
					if(bankShader instanceof glacier.Shader) {
						shader = bankShader;
					} else {
						glacier.error.invalidAssignment('shader', value, 'valid shader name as string', 'BufferObject');
					}
				} else {
					glacier.error.invalidAssignment('shader', shader, 'Shader', 'BufferObject');
				}
			}
		}
	});
};

glacier.BufferObject.MAX_TEXTURE_COUNT = 4;

glacier.BufferObject.prototype = {
	draw: function() {
		if(this.context && this.shader && this.elements) {
			var f32bpe = Float32Array.BYTES_PER_ELEMENT, gl = this.context.gl, attrib, uniform, mvp, t;
			
			this.shader.use();
			
			if((attrib = this.shader.attribute('vertex_position')) !== null) {
				if(this.buffers.vertex) {
					gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
					gl.enableVertexAttribArray(attrib);
					gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
				} else {
					gl.disableVertexAttribArray(attrib);
				}
			}
			
			if((attrib = this.shader.attribute('vertex_normal')) !== null) {
				if(this.buffers.normal) {
					gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
					gl.enableVertexAttribArray(attrib);
					gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
				} else {
					gl.disableVertexAttribArray(attrib);
				}
			}
			
			if((attrib = this.shader.attribute('vertex_uv')) !== null) {
				if(this.buffers.texCoord) {
					gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
					gl.enableVertexAttribArray(attrib);
					gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);
				} else {
					gl.disableVertexAttribArray(attrib);
				}
			}
			
			if((attrib = this.shader.attribute('vertex_color')) !== null) {
				if(this.buffers.color) {
					gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
					gl.enableVertexAttribArray(attrib);
					gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);
				} else {
					gl.disableVertexAttribArray(attrib);
				}
			}
			
			// Set uniform color to black if vertex color is present, otherwise use uniform color
			if((uniform = this.shader.uniform('color_rgba'))) {
				gl.uniform4fv(uniform, (attrib && this.buffers.color ? glacier.color.BLACK.array : this.color.array));
			}
			
			for(t = 0; t < glacier.BufferObject.MAX_TEXTURE_COUNT; ++t) {
				if((uniform = this.shader.uniform('tex_samp_' + t))) {
					gl.activeTexture(gl.TEXTURE0 + t);
					gl.bindTexture(gl.TEXTURE_2D, (this.textures[t] instanceof WebGLTexture ? this.textures[t] : null));
					gl.uniform1i(uniform, t);
				}
			}
			
			if((uniform = this.shader.uniform('matrix_mvp'))) {
				mvp = new glacier.Matrix44(this.parent.matrix);
				
				if(this.context.view instanceof glacier.Matrix44) {
					mvp.multiply(this.context.view);
				}
				
				if(this.context.projection instanceof glacier.Matrix44) {
					mvp.multiply(this.context.projection);
				}
				
				gl.uniformMatrix4fv(uniform, false, mvp.array);
			}
			
			if((uniform = this.shader.uniform('resolution'))) {
				gl.uniform2f(uniform, this.context.width, this.context.height);
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
			
			// Vertex Position buffer
			if(glacier.isArray(vertices, glacier.Vector3)) {
				if(vertices.length) {
					array = [];
					vertices.forEach(function(vertex) { array.push(vertex.x, vertex.y, vertex.z); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.vertex = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(vertices) {
				throw new glacier.exception.InvalidParameter('vertices', vertices, 'Vector3 array', 'init', 'BufferObject');
			}
			
			// Geometry Index buffer
			if(glacier.isArray(indices, 'number')) {
				if(indices.length) {
					array = [];
					indices.forEach(function(index) { array.push(index); });
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (this.buffers.index = gl.createBuffer()));
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
				}
			} else if(indices) {
				throw new glacier.exception.InvalidParameter('indices', indices, 'number array', 'init', 'BufferObject');
			}
			
			// Vertex Normal buffer
			if(glacier.isArray(normals, glacier.Vector3)) {
				if(normals.length) {
					array = [];
					normals.forEach(function(normal) { array.push(normal.x, normal.y, normal.z); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.normal = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(normals) {
				throw new glacier.exception.InvalidParameter('normals', normals, 'Vector3 array', 'init', 'BufferObject');
			}
			
			// Texture Coordinates buffer
			if(glacier.isArray(texCoords, glacier.Vector2)) {
				if(texCoords.length) {
					array = [];
					texCoords.forEach(function(texCoord) { array.push(texCoord.u, texCoord.v); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.texCoord = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(texCoords) {
				throw new glacier.exception.InvalidParameter('texCoords', texCoords, 'Vector2 array', 'init', 'BufferObject');
			}
			
			// Vertex Color buffer or Uniform Color
			if(glacier.isArray(colors, glacier.Color)) {
				if(colors.length) {
					array = [];
					colors.forEach(function(color) { array.push(color.r / 255, color.g  / 255, color.b  / 255, color.a); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.color = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(colors instanceof glacier.Color) {
				this.color.assign(colors);
			} else if(colors) {
				throw new glacier.exception.InvalidParameter('colors', colors, 'Color array', 'init', 'BufferObject');
			}
			
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			
			return true;
		}
		
		return false;
	},
	
	free: function() {
		if(this.context) {
			var i;
			
			for(i in this.buffers) {
				if(this.buffers.hasOwnProperty(i)) {
					this.context.gl.deleteBuffer(this.buffers[i]);
					delete this.buffers[i];
				}
			}
			
			for(i = 0; i < glacier.BufferObject.MAX_TEXTURE_COUNT; ++i) {
				this.freeTexture(i);
			}
		}
	},
	
	freeTexture: function(index) {
		if(this.context && this.textures[index]) {
			if(this.textures[index] instanceof WebGLTexture) {
				this.context.gl.deleteTexture(this.textures[index]);
			}
			
			this.textures[index] = null;
		}
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
			throw new glacier.exception.InvalidParameter(args[index], arg, 'positive number', '(constructor)', 'Camera');
		} else {
			Object.defineProperty(this, args[index], {
				get: function() {
					return arg;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0.0) {
						arg = value;
						
						this.projection.assignIdentity();
						this.projection.perspective(this.fieldOfView, this.aspectRatio, this.clipNear, this.clipFar);
					} else {
						glacier.error.invalidAssignment(args[index], value, 'positive number', 'Camera');
					}
				}
			});
		}
	}, this);
	
	// Declare typed members matrix, position, projection and target
	glacier.addTypedProperty(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'position', new glacier.Vector3(0, 1, 1), glacier.Vector3);
	glacier.addTypedProperty(this, 'projection', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'target', new glacier.Vector3(0, 0, 0), glacier.Vector3);
	
	this.update();
};

glacier.Camera.prototype = {
	follow: function(target, angle, distance) {
		if(!(target instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('target', target, 'Vector3', 'follow', 'Camera');
		}
		
		if(!(angle instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('angle', target, 'Vector2', 'follow', 'Camera');
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
		
		if((z = new glacier.Vector3(this.position).subtract(this.target)).length) {
			z.normalize();
		}
		
		if((x = y.cross(z)).length) {
			x.normalize();
		}
		
		if((y = z.cross(x)).length) {
			y.normalize();
		}
		
		this.matrix.assign([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).translate(-this.position.x, -this.position.y, -this.position.z);
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
					glacier.error.invalidAssignment('r', red, 'number between 0 and 255', 'Color');
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
					glacier.error.invalidAssignment('g', green, 'number between 0 and 255', 'Color');
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
					glacier.error.invalidAssignment('b', blue, 'number between 0 and 255', 'Color');
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
					glacier.error.invalidAssignment('a', alpha, 'number between 0.0 and 1.0', 'Color');
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
						glacier.error.invalidAssignment('rgb', '[' + rgb.join(', ') + ']', 'array[3] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgb = (typeof rgb == 'number' ? '0x' + rgb.toString(16).toUpperCase() : rgb);
					glacier.error.invalidAssignment('rgb', rgb, 'RGB as 24-bits integer or array[3] of numbers between 0.0 and 1.0', 'Color');
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
						glacier.error.invalidAssignment('rgba', '[' + rgba.join(', ') + ']', 'array[4] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgba = (typeof rgba == 'number' ? '0x' + rgba.toString(16).toUpperCase() : rgba);
					glacier.error.invalidAssignment('rgba', rgb, 'RGBA as 32-bits integer or array[4] of numbers between 0.0 and 1.0', 'Color');
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
					throw new glacier.exception.InvalidParameter(args[a], args[a], 'number', '(constructor)', 'Color');
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
	get array() {
		return new Float32Array([ this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a ]);
	},
	
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
	
	get copy() {
		return new glacier.Color(this);
	},
	
	invert: function() {
		this.rgb = (0xFFFFFF - this.rgb);
		return this;
	},
	
	get inverted() {
		return this.copy.invert();
	},
	
	toHtmlString: function(background) {
		var color = this.copy, str = '#', hex;
		
		if(color.a < 1.0) {
			background = (background instanceof glacier.Color ? background : glacier.color.WHITE);
			
			color.r = (color.r * color.a) + ((1.0 - color.a) * background.r);
			color.g = (color.g * color.a) + ((1.0 - color.a) * background.g);
			color.b = (color.b * color.a) + ((1.0 - color.a) * background.b);
			color.a = 1.0;
		}
		
		return '#' +
			('0' + color.r.toString(16)).slice(-2) +
			('0' + color.g.toString(16)).slice(-2) +
			('0' + color.b.toString(16)).slice(-2);
	},
	
	toString: function() {
		return 'rgba(' + [ this.r, this.g, this.b, this.a.toFixed(2) ].join(', ') + ')';
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

glacier.Context = function Context(canvas, options) {
	var background, context, element, projection = null, view = null;
	
	// Ensure canvas is a valid HTMLCanvasElement
	if(!(canvas instanceof HTMLCanvasElement)) {
		if(typeof canvas == 'string') {
			if((element = document.getElementById(canvas)) instanceof HTMLCanvasElement) {
				canvas = element;
			} else {
				throw new glacier.exception.InvalidParameter('canvas', canvas, 'string as HTMLCanvasElement ID', '(constructor)', 'Context');
			}
		} else {
			throw new glacier.exception.InvalidParameter('canvas', canvas, 'HTMLCanvasElement or string', '(constructor)', 'Context');
		}
	}
	
	// Ensure options is a valid map (object)
	if(options && typeof options != 'object') {
		throw new glacier.exception.InvalidParameter('options', canvas, 'object', '(constructor)', 'Context');
	} else if(!options) {
		options = {};
	}
	
	// Try creating a WebGL context based on commonly used names
	[ 'webgl', 'experimental-webgl' ].forEach(function(contextName) {
		if(!context) {
			context = canvas.getContext(contextName);
		}
	});
	
	// Throw exception if WebGL is not supported
	if(!window.WebGLRenderingContext || !(context instanceof WebGLRenderingContext)) {
		throw 'WebGL is not supported';
	}
	
	// Define background, canvas, gl, height, projection, shaders, view and width members
	Object.defineProperties(this, {
		background: {
			get: function() {
				return background;
			},
			set: function(color) {
				if(color instanceof glacier.Color) {
					background = color;
					context.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a);
					context.clear(context.COLOR_BUFFER_BIT);
				} else {
					glacier.error.invalidAssignment('background', color, 'Color', 'Context');
				}
			}
		},
		
		canvas:	{
			value: canvas
		},
		
		gl: {
			value: context
		},
		
		height: {
			get: function() {
				return this.canvas.height;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0) {
					this.resize(width, value);
				} else {
					glacier.error.invalidAssignment('height', value, 'positive number', 'Context');
				}
			}
		},
		
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
					glacier.error.invalidAssignment('projection', value, 'Matrix44 or null', 'Context');
				}
			}
		},
		
		shaders: {
			value: new glacier.ShaderBank(this)
		},
		
		view: {
			get: function() {
				return view;
			},
			set: function(value) {
				if(value instanceof glacier.Matrix44) {
					view = value;
				} else if(value === null) {
					view = null;
				} else {
					glacier.error.invalidAssignment('view', value, 'Matrix44 or null', 'Context');
				}
			}
		},
		
		width: {
			get: function() {
				return this.canvas.width;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0) {
					this.resize(value, height);
				} else {
					glacier.error.invalidAssignment('width', value, 'positive number', 'Context');
				}
			}
		}
	});
	
	this.background = glacier.color.BLACK;
	this.resize(canvas.offsetWidth, canvas.offsetHeight);
	this.shaders.init();
	
	window.addEventListener('resize', function(event) {
		if(canvas.width != canvas.offsetWidth || canvas.height != canvas.offsetHeight) {
			this.resize(canvas.offsetWidth, canvas.offsetHeight);
		}
	}.bind(this));
};

glacier.Context.prototype = {
	clear: function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	},
	
	draw: function(drawable) {
		if(drawable instanceof glacier.Drawable) {
			drawable.draw();
		}
	},
	
	init: function(drawable, options) {
		if(drawable instanceof glacier.Drawable) {
			return drawable.init(this, options);
		} else {
			throw new glacier.exception.InvalidParameter('drawable', drawable, 'Drawable', 'init', 'Context');
		}
		
		return false;
	},
	
	resize:	function(width, height) {
		if(typeof width != 'number' || width <= 0.0) {
			throw new glacier.exception.InvalidParameter('width', width, 'positive number', 'resize', 'Context');
		}
		
		if(typeof height != 'number' || height <= 0.0) {
			throw new glacier.exception.InvalidParameter('height', height, 'positive number', 'resize', 'Context');
		}
		
		this.canvas.width	= width;
		this.canvas.height	= height;
		this.gl.viewport(0, 0, width, height);
	},
	
	createProgram: function(vertShader, fragShader) {
		if(!(vertShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('vertShader', vertShader, 'WebGLShader', 'createProgram', 'Context');
		}
		
		if(!(fragShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('fragShader', fragShader, 'WebGLShader', 'createProgram', 'Context');
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
		var gl = this.gl, last, shader, valid = [ gl.FRAGMENT_SHADER, gl.VERTEX_SHADER ];
		
		if(typeof source != 'string') {
			throw new glacier.exception.InvalidParameter('source', source, 'string', 'createShader', 'Context');
		}
		
		if(valid.indexOf(type) == -1) {
			last = (valid = valid.join(', ')).lastIndexOf(', ');
			valid = (last >= 0 ? valid.substr(0, last) + ' or' + valid.substr(last + 1) : valid);
			throw new glacier.exception.InvalidParameter('type', type, valid, 'createShader', 'Context');
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
		
		throw new glacier.exception.InvalidParameter('image', image, 'Image', 'createTexture', 'Context');
	},
	
	screenToWorld: function(x, y) {
		if(typeof x != 'number') {
			throw new glacier.exception.InvalidParameter('x', x, 'number', 'screenToWorld', 'Context');
		}
		
		if(typeof y != 'number') {
			throw new glacier.exception.InvalidParameter('y', y, 'number', 'screenToWorld', 'Context');
		}
		
		var ndc = new glacier.Vector3(
			2.0 * (x / this.width) - 1.0,
			1.0 - 2.0 * (y / this.height),
			0.0
		), vec4 = new glacier.Vector4(ndc);
		
		if(this.projection instanceof glacier.Matrix44) {
			vec4.multiply(this.projection.inverse);
		}
		
		if(this.view instanceof glacier.Matrix44) {
			vec4.multiply(this.view.inverse);
		}
		
		return vec4.divide(vec4.w).xyz;
	},
	
	worldToScreen: function(point) {
		if(point instanceof glacier.Vector3) {
			var vec4 = new glacier.Vector4(point);
			
			if(this.view instanceof glacier.Matrix44) {
				vec4.multiply(this.view);
			}
			
			if(this.projection instanceof glacier.Matrix44) {
				vec4.multiply(this.projection);
			}
			
			if(vec4.w > 0.0) {
				vec4.divide(vec4.w).multiply(0.5).add(0.5);
				return new glacier.Vector2(Math.round(vec4.x * this.width), Math.round((1.0 - vec4.y) * this.height));
			}
		} else {
			throw new glacier.exception.InvalidParameter('point', point, 'Vector3', 'worldToScreen', 'Context');
		}
		
		return null;
	}
};

glacier.Drawable = function Drawable() {
	// Define aabb, matrix and visible members
	glacier.addTypedProperty(this, 'aabb', new glacier.BoundingBox(), glacier.BoundingBox);
	glacier.addTypedProperty(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'visible', true);
	
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
					glacier.error.invalidAssignment(property, value, 'number', 'Drawable');
				}
			}
		});
	}, this);
	
	var drawMode = glacier.draw.SOLID;
	
	// Define buffers and drawMode members
	Object.defineProperties(this, {
		buffers: {
			value: {
				solid:		null,
				wireframe:	null,
				bounding:	null,
				normals:	null
			}
		},
		drawMode: {
			get: function() {
				return drawMode;
			},
			set: function(mode) {
				if(typeof mode == 'number' && mode >= 0) {
					drawMode = mode;
				} else {
					glacier.error.invalidAssignment('drawMode', mode, 'number >= 0', 'Drawable');
				}
			}
		}
	});
};

glacier.draw = {
	SOLID:		0x01,
	WIREFRAME:	0x02,
	BOUNDING:	0x04,
	NORMALS:	0x08
};

glacier.Drawable.prototype = {
	free: function() {
		for(var b in this.buffers) {
			if(this.buffers.hasOwnProperty(b)) {
				if(this.buffers[b] instanceof glacier.BufferObject) {
					this.buffers[b].free();
					this.buffers[b] = null;
				}
			}
		}
		
		this.matrix		= new glacier.Matrix44();
		this.visible	= true;
	},
	draw: function() {
		if(this.visible && this.drawMode) {
			var d, bufferObj;
			
			for(d in glacier.draw) {
				if(glacier.draw.hasOwnProperty(d) && (this.drawMode & glacier.draw[d])) {
					if((bufferObj = this.buffers[d.toLowerCase()]) instanceof glacier.BufferObject) {
						bufferObj.draw();
					}
				}
			}
		}
	},
	init: function(context, options) {
		if(!(context instanceof glacier.Context)) {
			throw new glacier.exception.InvalidParameter('context', context, 'Context', 'init', 'Drawable');
		}
		
		var	shader = context.shaders.get('generic'),
			aabbMax = this.aabb.max,
			aabbMin = this.aabb.min,
			aabbVertices, aabbIndices;
			
		aabbVertices = [
			new glacier.Vector3(aabbMax.x, aabbMax.y, aabbMax.z),
			new glacier.Vector3(aabbMin.x, aabbMax.y, aabbMax.z),
			new glacier.Vector3(aabbMax.x, aabbMax.y, aabbMin.z),
			new glacier.Vector3(aabbMin.x, aabbMax.y, aabbMin.z),
			new glacier.Vector3(aabbMax.x, aabbMin.y, aabbMax.z),
			new glacier.Vector3(aabbMin.x, aabbMin.y, aabbMax.z),
			new glacier.Vector3(aabbMax.x, aabbMin.y, aabbMin.z),
			new glacier.Vector3(aabbMin.x, aabbMin.y, aabbMin.z)
		];
		
		aabbIndices = [ 0, 1, 4, 5, 7, 1, 3, 2, 7, 6, 4, 2, 0, 3, 7, 4, 0, 5, 3, 6, 2, 1, 5, 6 ];
		
		this.buffers.bounding = new glacier.BufferObject(this, context, shader);
		if(this.buffers.bounding.init(aabbVertices, aabbIndices, null, null, glacier.color.RED)) {
			this.buffers.bounding.drawMode = context.gl.LINE_LOOP;
			this.buffers.bounding.elements = 24;
		}
		
		if(typeof options == 'object') {
			if(typeof options.shader == 'string') {
				shader = context.shaders.get(options.shader);
			}
		} else if(options) {
			throw new glacier.exception.InvalidParameter('options', options, 'object', 'init', 'Drawable');
		}
		
		if(!(this.buffers.solid = new glacier.BufferObject(this, context, shader)).init()) {
			return false;
		}
		
		return true;
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
			type:		typeof value,
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

glacier.Scene = function Scene(container, options) {
	var camera, canvas, context, contextOptions = {}, running = false, id, self = this, previous;
	
	if(typeof container == 'string') {
		if(!((container = document.getElementById(container)) instanceof HTMLElement)) {
			throw new glacier.exception.UndefinedElement(container, '(constructor)', 'Scene');
		}
	} else if(!(container instanceof HTMLElement)) {
		throw new glacier.exception.InvalidParameter('container', container, '(constructor)', 'Scene');
	}
	
	if(container instanceof HTMLCanvasElement) {
		canvas = container;
		container = document.createElement('DIV');
		canvas.parentNode.insertBefore(container, canvas);
		container.appendChild(canvas);
		
		if((id = canvas.getAttribute('id'))) {
			canvas.removeAttribute('id');
			container.setAttribute('id', id);
		}
	} else {
		canvas = document.createElement('CANVAS');
		canvas.style.position = 'absolute';
		canvas.style.height = canvas.style.width = '100%';
		container.appendChild(canvas);
	}
	
	context = new glacier.Context(canvas, contextOptions);
	camera = new glacier.Camera(60.0, context.width / context.height, 1.0, 100.0);
	
	Object.defineProperties(self, {
		camera: { value: camera },
		container: { value: container },
		context: { value: context },
		runCallbacks: { value: {} },
		running: {
			get: function() {
				return !!running;
			},
			set: function(value) {
				if(typeof value == 'boolean') {
					if(value != running) {
						if((running = value)) {
							self.run();
						} else {
							self.end();
						}
					}
				} else {
					glacier.error.invalidAssignment('running', value, 'boolean', 'Scene');
				}
			}
		}
	});
	
	window.addEventListener('resize', function(event) {
		self.camera.aspectRatio = (context.width / context.height);
	});
	
	(function sceneRunner(timestamp) {
		if(self.running) {
			// Calculate dtime and FPS
			var dtime = (((timestamp - previous) / 1000.0) || 0.0), r;
			self.fps = (dtime ? (((1.0 / dtime) + self.fps) / 2.0) : 0.0);
			previous = timestamp;
			
			for(r in self.runCallbacks) {
				if(self.runCallbacks.hasOwnProperty(r)) {
					if(typeof (r = self.runCallbacks[r]) == 'function') {
						r.call(self, dtime);
					}
				}
			}
		}
		
		requestAnimationFrame(sceneRunner);
	})();
};

glacier.Scene.prototype = {
	addRunCallback: function(callback) {
		if(typeof callback == 'function') {
			var uid = glacier.generateUID();
			this.runCallbacks[uid] = callback;
			return uid;
		} else {
			throw new glacier.exception.InvalidParameter('callback', callback, 'addRunCallback', 'Scene');
		}
		
		return null;
	},
	
	end: function() {
		this.fps = 0.0;
		this.running = false;
	},
	
	removeRunCallback: function(uidOrCallback) {
		if(typeof uidOrCallback == 'string') {
			if(this.runCallbacks[uidOrCallback]) {
				return delete this.runCallbacks[uidOrCallback];
			}
		} else if(typeof uidOrCallback == 'function') {
			for(var r in this.runCallbacks) {
				if(this.runCallbacks[r] === uidOrCallback) {
					return delete this.runCallbacks[r];
				}
			}
		} else {
			throw new glacier.exception.InvalidParameter('uidOrCallback', uidOrCallback, 'removeRunCallback', 'Scene');
		}
		
		return false;
	},
	
	run: function() {
		this.running = true;
	}
};

glacier.Shader = function Shader(context, program) {
	if(!(context instanceof glacier.Context)) {
		throw new glacier.exception.InvalidParameter('context', context, 'Context', '(constructor)', 'Shader');
	}
	
	if(!(program instanceof WebGLProgram)) {
		throw new glacier.exception.InvalidParameter('program', program, 'WebGLProgram', '(constructor)', 'Shader');
	}
	
	Object.defineProperties(this, {
		attributes: { value: {} },
		context:	{ value: context },
		program:	{ value: program },
		uniforms:	{ value: {} }
	});
};

glacier.Shader.prototype = {
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
			throw new glacier.exception.InvalidParameter('attributeArray', attributeArray, 'string array', 'addAttributes', 'Shader');
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
			throw new glacier.exception.InvalidParameter('uniformArray', uniformArray, 'string array', 'addUniforms', 'Shader');
		}
	},
	attribute: function(attribute) {
		if(typeof attribute != 'string') {
			throw new glacier.exception.InvalidParameter('attribute', attribute, 'string', 'attribute', 'Shader');
		}
		
		if(typeof (attribute = this.attributes[attribute]) == 'number') {
			return (attribute >= 0 ? attribute : null);
		}
		
		return null;
	},
	uniform: function(uniform) {
		if(typeof uniform != 'string') {
			throw new glacier.exception.InvalidParameter('uniform', uniform, 'string', 'uniform', 'Shader');
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

glacier.ShaderBank = function ShaderBank(context) {
	if(!(context instanceof glacier.Context)) {
		throw new glacier.exception.InvalidParameter('context', context, 'Context', '(constructor)', 'ShaderBank');
	}
	
	Object.defineProperties(this, {
		context: { value: context },
		shaders: { value: {} }
	});
};

glacier.ShaderBank.prototype = {
	init: function() {
		if(this.context instanceof glacier.Context) {
			var attribExpr	= /attribute\s+(?:(?:high|medium|low)p\s+)?(?:float|(?:(?:vec|mat)[234]))\s+([a-zA-Z_]+[a-zA-Z0-9_]*)\s*;/g,
				uniformExpr	= /uniform\s+(?:(?:high|medium|low)p\s+)?(?:bool|int|float|(?:(?:vec|bvec|ivec|mat)[234])|(?:sampler(?:Cube|2D)))\s+([a-zA-Z_]+[a-zA-Z0-9_]*)(\[(?:(?:\d+)|(?:[a-zA-Z_]+[a-zA-Z0-9_]*))\])?\s*;/g,
				vertShaders = {}, fragShaders = {}, gl = this.context.gl, shaderMap = glacier.shaders, s, v, f, p, src, match, obj, vert, frag, prog;
				
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
							var shader = new glacier.Shader(this.context, prog);
							
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
	get: function(shader) {
		if(typeof shader != 'string') {
			throw new glacier.exception.InvalidParameter('shader', shader, 'string', 'shader', 'ShaderBank');
		}
		
		if((shader = this.shaders[shader]) instanceof glacier.Shader) {
			return shader;
		}
		
		return null;
	}
};

glacier.Texture = function Texture(source) {
	var image = null;
	
	Object.defineProperties(this, {
		onFreeCallbacks: { value: [] },
		onLoadCallbacks: { value: [] },
		image: {
			get: function() {
				return image;
			},
			set: function(value) {
				if(value instanceof Image) {
					var self = this;
					self.image = null;
					
					(image = value).onload = function() {
						if(!image.width || !image.height) {
							image = null;
							return;
						}
						
						self.onLoadCallbacks.forEach(function(callback) {
							if(typeof callback == 'function') {
								callback(image);
							}
						});
					};
				} else if(value === null) {
					if(image) {
						this.onFreeCallbacks.forEach(function(callback) {
							if(typeof callback == 'function') {
								callback();
							}
						});
					}
					
					image = null;
				} else {
					glacier.error.invalidAssignment('image', value, 'Image or null', 'Texture');
				}
			}
		}
	});
	
	if(typeof source == 'string') {
		this.load(source);
	} else if(source) {
		throw new glacier.exception.InvalidParameter('source', source, 'Image', '(constructor)', 'Texture');
	}
};

glacier.Texture.prototype = {
	free: function() {
		this.image = null;
	},
	load: function(source) {
		if(typeof source != 'string') {
			throw new glacier.exception.InvalidParameter('source', source, 'string', 'load', 'Texture');
		}
		
		this.image = new Image();
		this.image.src = source;
	},
	onFree: function(callback) {
		if(typeof callback == 'function') {
			this.onFreeCallbacks.push(callback);
		}
	},
	onLoad: function(callback) {
		if(typeof callback == 'function') {
			this.onLoadCallbacks.push(callback);
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
			throw new glacier.exception.InvalidParameter('ctor', ctor, 'function', '(constructor)', 'TypedArray');
		}
		
		Object.defineProperty(this, 'type', {
			value: { name: type, ctor: ctor }
		});
	} else {
		throw new glacier.exception.InvalidParameter('type', type, 'string', '(constructor)', 'TypedArray');
	}
};

glacier.extend(glacier.TypedArray, Array, {
	push: function(items) {
		var a, args = arguments;
		
		for(a = 0; a < args.length; ++a) {
			if((this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] == this.type.name)) {
				Array.prototype.push.call(this, args[a]);
			} else {
				throw new glacier.exception.InvalidParameter('item', args[a], this.type.name, 'push', 'TypedArray');
			}
		}
		
		return this.length;
	},
	splice: function(index, count, items) {
		var a, args = arguments;
		
		for(a = 2; a < args.length; ++a) {
			if(!(this.type.ctor && args[a] instanceof this.type.ctor) || (typeof args[a] != this.type.name)) {
				throw new glacier.exception.InvalidParameter('item', args[a], this.type.name, 'splice', 'TypedArray');
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
				throw new glacier.exception.InvalidParameter('item', args[a], this.type.name, 'unshift', 'TypedArray');
			}
		}
		
		return this.length;
	}
});

(function() {
	var geoJSON = {
		Feature: function(geometry, properties, id) {
			this.id = (id !== undefined ? id : null);
			this.geometry = (geometry || null);
			this.properties = (typeof properties == 'object' ? properties : {});
		},
		
		FeatureCollection: function(features) {
			this.features = (features instanceof Array ? features : []);
		},
		
		GeometryCollection: function(geometries) {
			this.geometries = (geometries instanceof Array ? geometries : []);
		},
		
		LineString: function(points) {
			this.points = (points instanceof Array ? points : []);
		},
		
		MultiLineString: function(lineStrings) {
			this.lineStrings = (lineStrings instanceof Array ? lineStrings : []);
		},
		
		MultiPoint: function(points) {
			this.points = (points instanceof Array ? points : []);
		},
		
		MultiPolygon: function(polygons) {
			this.polygons = (polygons instanceof Array ? polygons : []);
		},
		
		Point: function(lat, lng, alt) {
			this.lat = (typeof lat == 'number' ? lat : 0.0);
			this.lng = (typeof lng == 'number' ? lng : 0.0);
			this.alt = (typeof alt == 'number' ? alt : undefined);
		},
		
		Polygon: function(rings) {
			this.rings = (rings instanceof Array ? rings : []);
		},
		
		parse: function(stringOrObject) {
			var geojson, data;
			
			if(typeof stringOrObject == 'string') {
				try { geojson = JSON.parse(string); }
				catch(e) { return null; }
			} else if(typeof stringOrObject == 'object') {
				geojson = stringOrObject;
			} else {
				return null;
			}
			
			return geoJSON.parseObject(geojson);
		},
		
		parseGeometry: function(geometryObject) {
			if(typeof geometryObject == 'object') {
				var object, geometries = 'Point,MultiPoint,LineString,MultiLineString,Polygon,MultiPolygon,GeometryCollection'.split(',');
				
				if(geometries.indexOf(geometryObject.type) != -1) {
					return geoJSON.parseObject(geometryObject);
				}
			}
			
			return null; // Invalid Geometry
		},
		
		parseLineString: function(points) {
			if(points instanceof Array) {
				if(points.length >= 2) {
					var lineString = [], p;
					
					for(p in points) {
						if((p = geoJSON.parsePoint(points[p]))) {
							lineString.push(p);
						}
					}
					
					if(lineString.length == points.length) {
						return new geoJSON.LineString(lineString);
					}
				}
			}
			
			return null; // Invalid LineString
		},
		
		parseMultiLineString: function(lineStrings) {
			if(lineStrings instanceof Array) {
				var multiLineString = [], l;
				
				for(l in lineStrings) {
					if((l = geoJSON.parseLineString(lineStrings[l]))) {
						multiLineString.push(l);
					}
				}
				
				if(multiLineString.length == lineStrings.length) {
					return new geoJSON.MultiLineString(multiLineString);
				}
			}
			
			return null; // Invalid MultiLineString
		},
		
		parseMultiPoint: function(points) {
			if(points instanceof Array) {
				var multiPoint = [], p;
				
				for(p in points) {
					if((p = geoJSON.parsePoint(points[p]))) {
						multiPoint.push(p);
					}
				}
				
				if(multiPoint.length == points.length) {
					return new geoJSON.MultiPoint(multiPoint);
				}
			}
			
			return null; // Invalid MultiPoint
		},
		
		parseMultiPolygon: function(polygons) {
			if(polygons instanceof Array) {
				var multiPolygon = [], p;
				
				for(p in polygons) {
					if((p = geoJSON.parsePolygon(polygons[p]))) {
						multiPolygon.push(p);
					}
				}
				
				if(multiPolygon.length == polygons.length) {
					return new geoJSON.MultiPolygon(multiPolygon);
				}
			}
			
			return null; // Invalid MultiPolygon
		},
		
		parseObject: function(object) {
			if(typeof object == 'object') {
				var data;
				
				switch(object.type) {
					case 'Point':
						if((data = geoJSON.parsePoint(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiPoint':
						if((data = geoJSON.parseMultiPoint(object.coordinates))) {
							return data;
						} break;
						
					case 'LineString':
						if((data = geoJSON.parseLineString(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiLineString':
						if((data = geoJSON.parseMultiLineString(object.coordinates))) {
							return data;
						} break;
						
					case 'Polygon':
						if((data = geoJSON.parsePolygon(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiPolygon':
						if((data = geoJSON.parseMultiPolygon(object.coordinates))) {
							return data;
						} break;
						
					case 'GeometryCollection':
						if((data = geoJSON.parseGeometryCollection(object.geometries))) {
							return data;
						} break;
						
					case 'Feature':
						if((data = geoJSON.parseFeature(object))) {
							return data;
						} break;
						
					case 'FeatureCollection':
						if((data = geoJSON.parseFeatureCollection(object.features))) {
							return data;
						} break;
				}
			}
			
			return null; // Invalid GeoJSON object
		},
		
		parsePoint: function(coords) {
			if(coords instanceof Array) {
				var point = {
					lng: (typeof coords[0] == 'number' ? coords[0] : undefined),
					lat: (typeof coords[1] == 'number' ? coords[1] : undefined),
					alt: (typeof coords[2] == 'number' ? coords[2] : undefined)
				};
				
				if(point.lat !== undefined && point.lng !== undefined) {
					return new geoJSON.Point(point.lat, point.lng, point.alt);
				}
			}
			
			return null; // Invalid Point
		},
		
		parsePolygon: function(rings) {
			if(rings instanceof Array) {
				var polygon = [], r, points;
				
				for(r in rings) {
					if((r = geoJSON.parseLineString(rings[r]))) {
						if((points = r.length) >= 4 && r[0].compare(r[points - 1])) {
							polygon.push(r);
						}
					}
				}
				
				if(polygon.length == rings.length) {
					return new geoJSON.Polygon(polygon);
				}
			}
			
			return null; // Invalid Polygon
		},
		
		parseGeometryCollection: function(geometries) {
			if(geometries instanceof Array) {
				var geometryCollection = [], g;
				
				for(g in geometries) {
					if((g = geoJSON.parseGeometry(geometries[g]))) {
						geometryCollection.push(g);
					}
				}
				
				if(geometryCollection.length == geometries.length) {
					return new geoJSON.GeometryCollection(geometryCollection);
				}
			}
			
			return null; // Invalid GeometryCollection
		},
		
		parseFeature: function(featureObject) {
			if(typeof featureObject == 'object' && featureObject.type == 'Feature') {
				var geometry, properties, id = featureObject.id;
				
				if(featureObject.geometry !== null && !(geometry = geoJSON.parseGeometry(featureObject.geometry))) {
					return null; // Invalid geometry member
				}
				
				if((properties = featureObject.properties) !== null && typeof properties != 'object') {
					return null; // Invalid properties member
				}
				
				return new geoJSON.Feature(geometry, properties, id);
			}
			
			return null; // Invalid Feature
		},
		
		parseFeatureCollection: function(features) {
			if(features instanceof Array) {
				var featureCollection = [], f;
				
				for(f in features) {
					if((f = geoJSON.parseFeature(features[f]))) {
						featureCollection.push(f);
					}
				}
				
				if(featureCollection.length == features.length) {
					return new geoJSON.FeatureCollection(featureCollection);
				}
			}
			
			return null; // Invalid FeatureCollection
		},
		
		// Method to check whether an object is a valid geoJSON object
		validObject: function(object) {
			return (object instanceof geoJSON.Feature				||
					object instanceof geoJSON.FeatureCollection		||
					object instanceof geoJSON.GeometryCollection	||	
					object instanceof geoJSON.LineString			||
					object instanceof geoJSON.MultiLineString		||
					object instanceof geoJSON.MultiPoint			||
					object instanceof geoJSON.MultiPolygon			||
					object instanceof geoJSON.Polygon);
		}
	};
	
	// Extend geoJSON.Point with compare method
	geoJSON.Point.prototype = {
		compare: function(point, epsilon) {
			return ((point instanceof geoJSON.Point) &&
					(Math.abs(this.lat - point.lat) <= (epsilon || 0.0)) &&
					(Math.abs(this.lng - point.lng) <= (epsilon || 0.0)) &&
					(Math.abs(this.alt - point.alt) <= (epsilon || 0.0)));
		}
	};
	
	glacier.geoJSON = geoJSON;
})();

glacier.EPSILON = 10e-5;

glacier.compare = function(value1, value2, epsilon) {
	var e, val1Arr = glacier.isArray(value1), val2Arr = glacier.isArray(value2);
	
	if(typeof epsilon != 'number') {
		epsilon = glacier.EPSILON;
	}
	
	if(val1Arr && val2Arr) {
		if(value1.length == value2.length) {
			for(e = 0; e < value1.length; ++e) {
				if(typeof value1[e] == 'number' && typeof value2[e] == 'number') {
					if(Math.abs(value1[e] - value2[e]) >= epsilon) {
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
				if(Math.abs(arr[e] - val) >= epsilon) {
					return false;
				}
			} else if(arr[e] !== val) {
				return false;
			}
		}
		
		return true;
	} else if(typeof value1 == 'number' && typeof value2 == 'number') {
		return (Math.abs(value1 - value2) < epsilon);
	} else {
		return (value1 === value2);
	}
	
	return false;
};

glacier.degToRad = function(degrees) {
	if(typeof degrees != 'number') {
		throw new glacier.exception.InvalidParameter('degrees', degrees, 'number', 'degToRad');
	}
	
	return (degrees * Math.PI / 180.0);
};

glacier.radToDeg = function(radians) {
	if(typeof radians != 'number') {
		throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'radToDeg');
	}
	
	return (radians * 180.0 / Math.PI);
};

glacier.limitAngle = function(angle, max, min) {
	if(typeof angle != 'number') {
		throw new glacier.exception.InvalidParameter('angle', angle, 'number', 'limitAngle');
	}
	
	if(typeof (max = (max === undefined ? 360.0 : max)) != 'number') {
		throw new glacier.exception.InvalidParameter('max', max, 'number', 'limitAngle');
	}
	
	if(typeof (min = (min === undefined ? 0.0 : min)) != 'number') {
		throw new glacier.exception.InvalidParameter('min', min, 'number', 'limitAngle');
	}
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	while(angle > max) {
		angle = min + (angle - max);
	}
	
	while(angle < min) {
		angle = max + (angle - min);
	}
	
	return angle;
};

glacier.clamp = function(value, min, max) {
	var args = [ 'value', 'min', 'max' ];
	[ value, min, max ].forEach(function(arg, index) {
		if(typeof arg != 'number') {
			throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'clamp');
		}
	});
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	return Math.max(min, Math.min(max, value));
};

glacier.shaders = {
	
	// highp:	vertex positions, uv coordinates
	// mediump:	normals, lighting related vectors
	// lowp:	colors
	
	vertex: {
		generic: [
			'attribute highp vec3 vertex_position;',
			'attribute mediump vec3 vertex_normal;',
			'attribute lowp vec4 vertex_color;',
			'attribute highp vec2 vertex_uv;',
			'uniform highp mat4 matrix_mvp;',
			'uniform lowp vec4 color_rgba;',
			'varying highp vec4 vertex_pos;',
			'varying mediump vec3 mvp_normal;',
			'varying lowp vec4 frag_color;',
			'varying highp vec2 tex_coords;',
			'void main()',
			'{',
				'gl_PointSize = 2.0;',
				'gl_Position = vertex_pos = matrix_mvp * vec4(vertex_position, 1.0);',
				'mvp_normal = normalize(matrix_mvp * vec4(vertex_normal, 1.0)).xyz;',
				'frag_color = vertex_color + color_rgba;',
				'tex_coords = vertex_uv;',
			'}'
		]
	},
	fragment: {
		generic: [
			'varying lowp vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = frag_color;',
			'}'
		],
		globe: [
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'uniform sampler2D tex_samp_2;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(-28.0, 2.0, 12.0));',
				'vec3 normal = normalize(texture2D(tex_samp_2, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(mvp_normal, lightPos), 0.0);',
				'vec3 dayColor = texture2D(tex_samp_0, tex_coords).rgb * diffuse;',
				'vec3 nightColor = texture2D(tex_samp_1, tex_coords).rgb * (1.0 - diffuse);',
				'vec3 normalColor = dayColor * max(dot(normal, lightPos), 0.3);',
				'dayColor = ((1.0 - nightColor) * dayColor) + normalColor;',
				'gl_FragColor = vec4(dayColor + ((1.0 - dayColor) * nightColor * 0.5), 1.0);',
			'}'
		],
		normalMapped: [
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
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
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
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
					glacier.error.invalidAssignment(property, value, 'string or null', 'Mesh');
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
	},
	init: function(context, options) {
		var self = this;
		
		// Calculate AABB
		self.aabb.reset();
		self.vertices.forEach(function(vertex) {
			self.aabb.min.minimize(vertex);
			self.aabb.max.maximize(vertex);
		});
		
		if(glacier.Drawable.prototype.init.call(this, context, options)) {
			// Initialize buffers
			if(self.buffers.solid.init(self.vertices, self.indices, self.normals, self.texCoords, self.colors)) {
				self.buffers.solid.elements = (self.indices.length ? self.indices.length : self.vertices.length / 3);
				self.buffers.solid.drawMode = context.gl.TRIANGLES;
				
				// Enable texture hot-swapping
				[ 0, 1, 2, 3 ].forEach(function(tex) {
					self['texture' + tex].onLoad(function(image) { self.buffers.solid.textures[tex] = context.createTexture(image); });
					self['texture' + tex].onFree(function() { self.buffers.solid.freeTexture(tex); });
				});
				
				return true;
			}
		}
		
		self.buffers.solid = null;
		return false;
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
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'addPoint', 'PointCollection');
		}
		
		if(!color || (color instanceof glacier.Color)) {
			this.colors.push(color || glacier.color.WHITE);
		} else {
			throw new glacier.exception.InvalidParameter('color', color, 'Color', 'addPoint', 'PointCollection');
		}
		
		this.vertices.push(vec3);
	},
	free: function() {
		glacier.Drawable.prototype.free.call(this);
		
		this.colors.length		= 0;
		this.vertices.length	= 0;
	},
	init: function(context, options) {
		var self = this;
		
		// Calculate AABB
		self.aabb.reset();
		self.vertices.forEach(function(vertex) {
			self.aabb.min.minimize(vertex);
			self.aabb.max.maximize(vertex);
		});
		
		if(glacier.Drawable.prototype.init.call(this, context, options)) {
			// Initialize buffers
			if(self.buffers.solid.init(self.vertices, null, null, null, self.colors)) {
				self.buffers.solid.elements = self.vertices.length;
				self.buffers.solid.drawMode = context.gl.POINTS;
				return true;
			}
		}
		
		self.buffers.solid = null;
		return false;
	}
});

glacier.BoundingBox = function BoundingBox(minOrBoundingBox, max) {
	glacier.addTypedProperty(this, 'min', new glacier.Vector3( Number.MAX_VALUE), glacier.Vector3);
	glacier.addTypedProperty(this, 'max', new glacier.Vector3(-Number.MAX_VALUE), glacier.Vector3);
	
	if(minOrBoundingBox !== undefined && minOrBoundingBox !== null) {
		this.assign(minOrBoundingBox, max);
	}
};

glacier.BoundingBox.prototype = {
	add: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			this.min.add(vec3);
			this.max.add(vec3);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'add', 'BoundingBox');
		}
		
		return this;
	},
	
	assign: function(minOrBoundingBox, max) {
		if(minOrBoundingBox instanceof glacier.BoundingBox) {
			return this.assign(minOrBoundingBox.min, minOrBoundingBox.max);
		} else {
			var args = [ 'min', 'max' ], min = minOrBoundingBox;
			
			[ min, max ].forEach(function(arg, index) {
				if(!(arg instanceof glacier.Vector3)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'Vector3', 'assign', 'BoundingBox');
				}
			});
			
			this.min.assign(min);
			this.max.assign(max);
		}
		
		return this;
	},
	
	get copy() {
		return new glacier.BoundingBox(this);
	},
	
	get matrix() {
		var half = new glacier.Vector3(this.max).subtract(this.min).divide(2),
			matrix = new glacier.Matrix44();
			
		return matrix.translate(this.min.copy.add(half)).scale(half);
	},
	
	reset: function() {
		this.min.assign( Number.MAX_VALUE);
		this.max.assign(-Number.MAX_VALUE);
	},
	
	subtract: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			this.min.subtract(vec3);
			this.max.subtract(vec3);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'subtract', 'BoundingBox');
		}
		
		return this;
	},
	
	toString: function() {
		return ('BoundingBox(' + this.min.toString() + ', ' + this.max.toString() + ')');
	},
	
	update: function(min, max, matrix) {
		if(!(min instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector3', 'update', 'BoundingBox');
		}
		
		if(!(max instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector3', 'update', 'BoundingBox');
		}
		
		if(!(matrix instanceof glacier.Matrix44)) {
			matrix = new glacier.Matrix44();
		}
		
		this.reset();
		
		[
			[ max.x, max.y, max.z ], // rtf
			[ min.x, max.y, max.z ], // ltf
			[ max.x, max.y, min.z ], // rtb
			[ min.x, max.y, min.z ], // ltb
			[ max.x, min.y, max.z ], // rbf
			[ min.x, min.y, max.z ], // lbf
			[ max.x, min.y, min.z ], // rbb
			[ min.x, min.y, min.z ]  // lbb
		]
		.forEach(function(plane) {
			var vec3 = new glacier.Vector3(plane[0], plane[1], plane[2]).multiply(matrix);
			this.min.minimize(vec3);
			this.max.maximize(vec3);
		}, this);
	}
};

glacier.Matrix33 = function Matrix33(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]),
	});
	
	if(value !== undefined && value !== null) {
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33, Matrix44 or array[9]', 'assign', 'Matrix33');
		}
		
		return this;
	},
	
	assignIdentity: function() {
		for(var i = 0; i < 9; ++i) {
			this.array[i] = (i % 4 ? 0.0 : 1.0);
		}
	},
	
	get copy() {
		return new glacier.Matrix33(this);
	},
	
	get determinant() {
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
	
	get inverse() {
		var temp = this.copy;
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33 or Matrix44', 'multiply', 'Matrix33');
		}
		
		return this;
	},
	
	toString: function() {
		return ('[[' + this.array[0].toPrecision(5) + ', ' + this.array[1].toPrecision(5) + ', ' + this.array[2].toPrecision(5) + '], ' +
				 '[' + this.array[3].toPrecision(5) + ', ' + this.array[4].toPrecision(5) + ', ' + this.array[5].toPrecision(5) + '], ' +
				 '[' + this.array[6].toPrecision(5) + ', ' + this.array[7].toPrecision(5) + ', ' + this.array[8].toPrecision(5) + ']]');
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
	
	get transposed() {
		return this.copy.transpose();
	}
};

glacier.Matrix44 = function Matrix44(value) {
	Object.defineProperty(this, 'array', {
		value: new Float32Array([ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ]),
	});
	
	if(value !== undefined && value !== null) {
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33, Matrix44 or array[16]', 'assign', 'Matrix44');
		}
		
		return this;
	},
	
	assignIdentity: function() {
		for(var i = 0; i < 16; ++i) {
			this.array[i] = (i % 5 ? 0.0 : 1.0);
		}
	},
	
	get copy() {
		return new glacier.Matrix44(this);
	},
	
	get determinant() {
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
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'frustum', 'Matrix44');
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
	
	get inverse() {
		var temp = this.copy;
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number, Matrix33 or Matrix44', 'multiply', 'Matrix44');
		}
		
		return this;
	},
	
	ortho: function(left, right, bottom, top, near, far) {
		var args = 'left,right,bottom,top,near,far'.split(',');
		
		[ left, right, bottom, top, near, far ].forEach(function(arg, index) {
			if(typeof arg != 'number') {
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'ortho', 'Matrix44');
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
				throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'perspective', 'Matrix44');
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
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotate', 'Matrix44');
		} else if(xOrVec3 instanceof glacier.Vector3) {
			return this.rotate(radians, xOrVec3.x, xOrVec3.y, xOrVec3.z);
		} else {
			var args = [ 'x', 'y', 'z' ], x = xOrVec3, cosRad, sinRad, mag, oneMinusCos;
			
			[ x, y, z ].forEach(function(arg, index) {
				if(typeof arg != 'number') {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'rotate', 'Matrix44');
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
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'scale', 'Matrix44');
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
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'translate', 'Matrix44');
				}
			});
			
			this.array[12] += (this.array[ 0] * x + this.array[ 4] * y + this.array[ 8] * z);
			this.array[13] += (this.array[ 1] * x + this.array[ 5] * y + this.array[ 9] * z);
			this.array[14] += (this.array[ 2] * x + this.array[ 6] * y + this.array[10] * z);
			this.array[15] += (this.array[ 3] * x + this.array[ 7] * y + this.array[11] * z);
		}
		
		return this;
	},
	
	get translation() {
		return new glacier.Vector3(this.array[12], this.array[13], this.array[14]);
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
	
	get transposed() {
		return this.copy.transpose();
	}
};

(function() {
	function Cell(min, max, parent) {
		// Determine root
		var root = (parent.root || parent);
		while(root && root.parent) {
			root = root.parent;
		}
		
		// Define Cell properties
		Object.defineProperties(this, {
			children: { value: [] },
			max: { value: max },
			min: { value: min },
			parent: { value: parent },
			points: { value: [] },
			root: { value: root }
		});
	}
	
	Cell.prototype = {
		add: function(point) {
			if(point instanceof glacier.Vector3) {
				if(this.contains(point)) {
					if(!this.children.length) {
						if(this.points.length < this.root.cellCapacity) {
							this.points.push(point);
							return true;
						} else if(!this.split()) {
							return false;
						}
					}
					
					for(var child in this.children) {
						if((child = this.children[child]).contains(point)) {
							return child.add(point);
						}
					}
				}
			}
			
			return false;
		},
		
		clear: function() {
			this.children.length = this.points.length = 0;
		},
		
		contains: function(point) {
			if(point instanceof glacier.Vector3) {
				return (point.x >= this.min.x && point.y >= this.min.y && point.z >= this.min.z &&
						point.x <= this.max.x && point.y <= this.max.y && point.z <= this.max.z);
			}
			
			return false;
		},
		
		get level() {
			var level = 0, parent = this.parent;
			
			while(parent && (parent = parent.parent)) {
				level++;
			}
			
			return level;
		},
		
		remove: function(point) {
			if(point instanceof glacier.Vector3) {
				if(this.contains(point)) {
					var n;
					
					for(n in this.points) {
						if(this.points[n] === point) {
							this.points.splice(n, 1);
							return true;
						}
					}
					
					for(n in this.children) {
						if(this.children[n].remove(point)) {
							return true;
						}
					}
				}
			}
			
			return false;
		},
		
		split: function() {
			if(!this.children.length) {
				var min = this.min, max = this.max, cen = max.copy.subtract(min), point, cell;
					
				this.children.push(
					new Cell(new glacier.Vector3(min.x, min.y, min.z), new glacier.Vector3(cen.x, cen.y, cen.z), this),
					new Cell(new glacier.Vector3(cen.x, min.y, min.z), new glacier.Vector3(max.x, cen.y, cen.z), this),
					new Cell(new glacier.Vector3(min.x, min.y, cen.z), new glacier.Vector3(cen.x, cen.y, max.z), this),
					new Cell(new glacier.Vector3(cen.x, min.y, cen.z), new glacier.Vector3(max.x, cen.y, max.z), this),
					new Cell(new glacier.Vector3(min.x, cen.y, min.z), new glacier.Vector3(cen.x, max.y, cen.z), this),
					new Cell(new glacier.Vector3(cen.x, cen.y, min.z), new glacier.Vector3(max.x, max.y, cen.z), this),
					new Cell(new glacier.Vector3(min.x, cen.y, cen.z), new glacier.Vector3(cen.x, max.y, max.z), this),
					new Cell(new glacier.Vector3(cen.x, cen.y, cen.z), new glacier.Vector3(max.x, max.y, max.z), this)
				);
				
				return true;
			}
			
			return false;
		}
	};
	
	// TODO: Octree constructor from min/max boundaries
	function Octree(points, cellCapacity) {
		if(glacier.isArray(points, glacier.Vector3)) {
			var min = new glacier.Vector3( Infinity),
				max = new glacier.Vector3(-Infinity),
				root;
				
			// Use 8 as default cellCapacity if cellCapacity is not a number
			cellCapacity = (typeof cellCapacity == 'number' ? Math.abs(cellCapacity) : 8);
			
			Object.defineProperty(this, 'cellCapacity', {
				get: function() {
					return cellCapacity;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						cellCapacity = Math.ceil(value);
						// TODO: Rebuilt tree with new cell capacity
					}
				}
				
			});
			
			if(glacier.isArray(points, glacier.Vector3)) {
				// Calculate octree boundaries
				points.forEach(function(point) {
					min.minimize(point);
					max.maximize(point);
				});
				
				// Create root cell, and add points
				root = new Cell(min, max, this);
				points.forEach(function(point) {
					root.add(point);
				});
			}
			
			Object.defineProperty(this, 'root', { value: root });
		} else {
			throw new glacier.exception.InvalidParameter('points', points, 'Vector3 Array', '(constructor)', 'Octree');
		}
	}
	
	Octree.prototype = {
		add: function(point) {
			return this.root.add(point);
		},
		
		clear: function() {
			this.root.clear();
		},
		
		contains: function(point) {
			return this.root.contains(point);
		},
		
		get max() {
			return this.root.max;
		},
		
		get min() {
			return this.root.min;
		},
		
		get points() {
			function childPoints(cell) {
				var points = [];
				
				cell.points.forEach(function(point) {
					points.push(point);
				});
				
				cell.children.forEach(function(child) {
					childPoints(child).forEach(function(point) {
						points.push(point);
					});
				});
				
				return points;
			}
			
			return childPoints(this.root);
		},
		
		remove: function(point) {
			return this.root.remove(point);
		},
	};

	glacier.Octree = Octree;
})();

glacier.Ray = function Ray(origin, direction) {
	glacier.addTypedProperty(this, ['a', 'origin'], new glacier.Vector3(0.0), glacier.Vector3);
	glacier.addTypedProperty(this, ['b', 'direction'], new glacier.Vector3(0.0), glacier.Vector3);
	
	this.assign(origin, direction);
};

glacier.Ray.prototype = {
	get array() {
		return new Float32Array([ this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z ]);
	},
	
	assign: function(originOrRay, direction) {
		if(originOrRay instanceof glacier.Ray) {
			return this.assign(originOrRay.a, originOrRay.b);
		} else {
			var args = [ 'origin', 'direction' ];
			
			[ originOrRay, direction ].forEach(function(arg, index) {
				if(!(arg instanceof glacier.Vector3)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'Vector3', 'assign', 'Ray');
				}
			});
			
			this.a = originOrRay.copy;
			this.b = direction.copy;
		}
		
		return this;
	},
	
	boxIntersection: function(min, max) {
		if(!(min instanceof glacier.Vector3)) {
			throw new glacier.excepetion.InvalidParameter('min', min, 'Vector3', 'boxIntersection', 'Ray');
		}
		
		if(!(max instanceof glacier.Vector3)) {
			throw new glacier.excepetion.InvalidParameter('max', max, 'Vector3', 'boxIntersection', 'Ray');
		}
		
		var dir = new glacier.Vector3(1.0).divide(this.b),
			t1 = (min.x - this.a.x) * dir.x,
			t2 = (max.x - this.a.x) * dir.x,
			t3 = (min.y - this.a.y) * dir.y,
			t4 = (max.y - this.a.y) * dir.y,
			t5 = (min.z - this.a.z) * dir.z,
			t6 = (max.z - this.a.z) * dir.z,
			tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6)),
			tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));
			
		// Check if ray is behind, or avoids intersection
		if(tmax < 0 || tmin > tmax) {
			return null;
		}
		
		return this.b.copy.multiply(tmin).add(this.a);
	},
	
	deviation: function(ray) {
		if(ray instanceof glacier.Ray) {
			return this.b.dot(ray.b);
		} else {
			throw new glacier.exception.InvalidParameter('ray', ray, 'Ray', 'deviation', 'Ray');
		}
	},
	
	intersects: function(geometry) {
		if(geometry instanceof glacier.Sphere) {
			return this.sphereIntersection(geometry.matrix.translation, geometry.radius);
		} else if(geometry instanceof glacier.BoundingBox) {
			return this.boxIntersection(geometry.min, geometry.max);
		} else {
			console.warn('Ray.intersects currently only supports sphere intersections');
		}
		
		return null;
	},
	
	sphereIntersection: function(center, radius) {
		if(!(center instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('center', center, 'Vector3', 'sphereIntersection', 'Ray');
		}
		
		if(typeof radius != 'number') {
			throw new glacier.exception.InvalidParameter('radius', radius, 'number', 'sphereIntersection', 'Ray');
		}
		
		var o = this.a,
			p = this.b.copy.subtract(o),
			a = p.dot(p),
			b = (2 * p.x * (o.x - center.x)) + (2 * p.y * (o.y - center.y)) + (2 * p.z * (o.z - center.z)),
			c = (center.dot(center) + o.dot(o)) - (2 * center.dot(o)) - (radius * radius),
			d = (b * b) - (4 * a * c), t;
			
		if(d < 0) {
			return null;
		}
		
		t = (-b - Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
		return new glacier.Vector3(o.x + (t * p.x), o.y + (t * p.y), o.z + (t * p.z));
	},
	
	toString: function() {
		return ('Ray(' + this.a.toString() + ' + ' + this.b.normalized.toString() + ')');
	}
};

glacier.Vector2 = function Vector2(xScalarOrVec2, y) {
	glacier.addTypedProperty(this, [ 'x', 'u', 'lng' ], 0.0);
	glacier.addTypedProperty(this, [ 'y', 'v', 'lat' ], 0.0);
	
	if(xScalarOrVec2 !== undefined && xScalarOrVec2 !== null) {
		this.assign(xScalarOrVec2, y);
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'add', 'Vector2');
		}
		
		return this;
	},
	
	get array() {
		return new Float32Array([ this.x, this.y ]);
	},
	
	assign: function(xScalarOrVec2, y) {
		if(xScalarOrVec2 instanceof glacier.Vector2) {
			return this.assign(xScalarOrVec2.x, xScalarOrVec2.y);
		} else if(typeof xScalarOrVec2 == 'number' && y === undefined) {
			return this.assign(xScalarOrVec2, xScalarOrVec2);
		} else {
			var args = [ 'x', 'y' ], x = xScalarOrVec2;
			
			[ x, y ].forEach(function(arg, index) {
				if(isNaN(arg)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector2');
				}
			});
			
			this.x = x;
			this.y = y;
		}
		
		return this;
	},
	
	compare: function(vec2, epsilon) {
		if(vec2 instanceof glacier.Vector2) {
			return (glacier.compare(this.x, vec2.x, epsilon) &&
					glacier.compare(this.y, vec2.y, epsilon));
		}
		
		throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'compare', 'Vector2');
	},
	
	get copy() {
		return new glacier.Vector2(this);
	},

	distance: function(vec2) {
		if(vec2 instanceof glacier.Vector2) {
			var dx = this.x - vec2.x, dy = this.y - vec2.y;
			return Math.sqrt(dx * dx + dy * dy);
		}
		
		throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'distance', 'Vector2');
	},
	
	divide: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x /= value.x;
			this.y /= value.y;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'divide', 'Vector2');
		}
		
		return this;
	},
	
	dot: function(vec2) {
		if(vec2 instanceof glacier.Vector2) {
			return ((this.x * vec2.x) + (this.y * vec2.y));
		}
		
		throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'dot', 'Vector2');
	},
	
	get length() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y));
	},
	
	maximize: function(max) {
		if(max instanceof glacier.Vector2) {
			this.x = Math.max(this.x, max.x);
			this.y = Math.max(this.y, max.y);
		} else {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector2', 'minimize', 'Vector2');
		}
		
		return this;
	},
	
	minimize: function(min) {
		if(min instanceof glacier.Vector2) {
			this.x = Math.min(this.x, min.x);
			this.y = Math.min(this.y, min.y);
		} else {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector2', 'minimize', 'Vector2');
		}
		
		return this;
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector2) {
			this.x *= value.x;
			this.y *= value.y;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'multiply', 'Vector2');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		
		return this;
	},
	
	get normalized() {
		return this.copy.normalize();
	},
	
	rotate: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.y * sinRad));
			var rotY = ((this.x * sinRad) + (this.y * cosRad));
			
			this.x = rotX;
			this.y = rotY;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotate', 'Vector2');
		}
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector2', 'subtract', 'Vector2');
		}
		
		return this;
	},
	
	swap: function(vec2) {
		if(vec2 instanceof glacier.Vector2) {
			this.x = vec2.x + (vec2.x = this.x, 0);
			this.y = vec2.y + (vec2.y = this.y, 0);
		} else {
			throw new glacier.exception.InvalidParameter('vec2', vec2, 'Vector2', 'swap', 'Vector2');
		}
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ')');
	}
};

glacier.Vector3 = function Vector3(x, y, z) {
	glacier.addTypedProperty(this, 'x', 0.0);
	glacier.addTypedProperty(this, 'y', 0.0);
	glacier.addTypedProperty(this, 'z', 0.0);
	
	this.assign(x, y, z);
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector3', 'add', 'Vector3');
		}
		
		return this;
	},
	
	angle: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			var angle = Math.acos(this.dot(vec3) / (this.length * vec3.length));
			return (isNaN(angle) ? 0.0 : angle);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'angle', 'Vector3');
		}
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z ]);
	},
	
	assign: function(x, y, z) {
		if(x !== null && x !== undefined) {
			if(x instanceof glacier.Vector3) {
				this.assign(x.x, x.y, x.z);
			} else if(x instanceof glacier.Vector2) {
				this.assign(x.x, x.y, (typeof y == 'number' ? y : 0.0));
			} else if(typeof x == 'number' && y === undefined) {
				this.assign(x, x, x, x);
			} else {
				var args = [ 'x', 'y', 'z' ];
				
				[ x, y, z ].forEach(function(arg, index) {
					if(isNaN(arg)) {
						throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector3');
					}
				});
				
				this.x = x;
				this.y = y;
				this.z = z;
			}
		}
		
		return this;
	},
	
	compare: function(vec3, epsilon) {
		if(vec3 instanceof glacier.Vector3) {
			return (glacier.compare(this.x, vec3.x, epsilon) &&
					glacier.compare(this.y, vec3.y, epsilon) &&
					glacier.compare(this.z, vec3.z, epsilon));
		}
		
		throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'compare', 'Vector3');
	},
	
	get copy() {
		return new glacier.Vector3(this);
	},
	
	cross: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			return new glacier.Vector3(
				(this.y * vec3.z) - (this.z * vec3.y),
				(this.z * vec3.x) - (this.x * vec3.z),
				(this.x * vec3.y) - (this.y * vec3.x)
			);
		}
		
		throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'cross', 'Vector3');
	},
	
	distance: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			var dx = this.x - vec3.x, dy = this.y - vec3.y, dz = this.z - vec3.z;
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}
		
		throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'distance', 'Vector3');
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
			this.assign(
				(this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2)),
				(this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2)),
				(this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2))
			);
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x / value.element(0, 0)) + (this.y / value.element(0, 1)) + (this.z / value.element(0, 2)) + value.element(0, 3),
				(this.x / value.element(1, 0)) + (this.y / value.element(1, 1)) + (this.z / value.element(1, 2)) + value.element(1, 3),
				(this.x / value.element(2, 0)) + (this.y / value.element(2, 1)) + (this.z / value.element(2, 2)) + value.element(2, 3)
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector3, Matrix33 or Matrix44', 'divide', 'Vector3');
		}
		
		return this;
	},
	
	dot: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			return ((this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z));
		}
		
		throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'dot', 'Vector3');
	},
	
	get length() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	},
	
	maximize: function(max) {
		if(max instanceof glacier.Vector3) {
			this.x = Math.max(this.x, max.x);
			this.y = Math.max(this.y, max.y);
			this.z = Math.max(this.z, max.z);
		} else {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector3', 'minimize', 'Vector3');
		}
		
		return this;
	},
	
	minimize: function(min) {
		if(min instanceof glacier.Vector3) {
			this.x = Math.min(this.x, min.x);
			this.y = Math.min(this.y, min.y);
			this.z = Math.min(this.z, min.z);
		} else {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector3', 'minimize', 'Vector3');
		}
		
		return this;
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
			this.assign(
				(this.x * value.array[0]) + (this.y * value.array[3]) + (this.z * value.array[6]),
				(this.x * value.array[1]) + (this.y * value.array[4]) + (this.z * value.array[7]),
				(this.x * value.array[2]) + (this.y * value.array[5]) + (this.z * value.array[9])
			);
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x * value.array[0]) + (this.y * value.array[4]) + (this.z * value.array[ 8]) + value.array[12],
				(this.x * value.array[1]) + (this.y * value.array[5]) + (this.z * value.array[ 9]) + value.array[13],
				(this.x * value.array[2]) + (this.y * value.array[6]) + (this.z * value.array[10]) + value.array[14]
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector3, Matrix33 or Matrix44', 'multiply', 'Vector3');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		
		return this;
	},
	
	get normalized() {
		return this.copy.normalize();
	},
	
	rotateX: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotY = ((this.y * cosRad) - (this.z * sinRad));
			var rotZ = ((this.y * sinRad) + (this.z * cosRad));
			
			this.y = rotY;
			this.z = rotZ;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateX', 'Vector3');
		}
		
		return this;
	},
	
	rotateY: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.z * sinRad));
			var rotZ = ((this.x * sinRad) + (this.z * cosRad));
			
			this.x = rotX;
			this.z = rotZ;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateY', 'Vector3');
		}
		
		return this;
	},
	
	rotateZ: function(radians) {
		if(typeof radians == 'number') {
			var cosRad = Math.cos(radians);
			var sinRad = Math.sin(radians);
			
			var rotX = ((this.x * cosRad) - (this.y * sinRad));
			var rotY = ((this.x * sinRad) + (this.y * cosRad));
			
			this.x = rotX;
			this.y = rotY;
		} else {
			throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'rotateZ', 'Vector3');
		}
		
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
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector3', 'subtract', 'Vector3');
		}
		
		return this;
	},
	
	swap: function(vec3) {
		if(vec3 instanceof glacier.Vector3) {
			this.x = vec3.x + (vec3.x = this.x, 0);
			this.y = vec3.y + (vec3.y = this.y, 0);
			this.z = vec3.z + (vec3.z = this.z, 0);
		} else {
			throw new glacier.exception.InvalidParameter('vec3', vec3, 'Vector3', 'swap', 'Vector3');
		}
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ')');
	},
	
	get xy() {
		return new glacier.Vector2(this.x, this.y);
	},
	
	get xz() {
		return new glacier.Vector2(this.x, this.z);
	},
	
	get yz() {
		return new glacier.Vector2(this.y, this.z);
	}
};

glacier.Vector4 = function Vector4(x, y, z, w) {
	glacier.addTypedProperty(this, 'x', 0.0);
	glacier.addTypedProperty(this, 'y', 0.0);
	glacier.addTypedProperty(this, 'z', 0.0);
	glacier.addTypedProperty(this, 'w', 0.0);
	
	this.assign(x, y, z, w);
};

glacier.Vector4.prototype = {
	add: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
			this.w += value.w;
		} else if(typeof value == 'number') {
			this.x += value;
			this.y += value;
			this.z += value;
			this.w += value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector4', 'add', 'Vector4');
		}
		
		return this;
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z, this.w ]);
	},
	
	assign: function(x, y, z, w) {
		if(x !== null && x !== undefined) {
			if(x instanceof glacier.Vector4) {
				this.assign(x.x, x.y, x.z, x.w);
			} else if(x instanceof glacier.Vector3) {
				this.assign(x.x, x.y, x.z, (typeof y == 'number' ? y : 1.0));
			} else if(x instanceof glacier.Vector2) {
				this.assign(x.x, x.y, (typeof y == 'number' ? y : 0.0), (typeof z == 'number' ? z : 1.0));
			} else if(typeof x == 'number' && y === undefined) {
				this.assign(x, x, x, x);
			} else {
				var args = [ 'x', 'y', 'z', 'w' ];
				
				[ x, y, z, w ].forEach(function(arg, index) {
					if(isNaN(arg)) {
						throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Vector4');
					}
				});
				
				this.x = x;
				this.y = y;
				this.z = z;
				this.w = w;
			}
		}
		
		return this;
	},
	
	compare: function(vec4, epsilon) {
		if(vec4 instanceof glacier.Vector4) {
			return (glacier.compare(this.x, vec4.x, epsilon) &&
					glacier.compare(this.y, vec4.y, epsilon) &&
					glacier.compare(this.z, vec4.z, epsilon) &&
					glacier.compare(this.w, vec4.w, epsilon));
		}
		
		throw new glacier.exception.InvalidParameter('vec4', vec4, 'Vector4', 'compare', 'Vector4');
	},
	
	get copy() {
		return new glacier.Vector4(this);
	},

	divide: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x /= value.x;
			this.y /= value.y;
			this.z /= value.z;
			this.w /= value.w;
		} else if(typeof value == 'number') {
			this.x /= value;
			this.y /= value;
			this.z /= value;
			this.w /= value;
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x / value.array[0]) + (this.y / value.array[4]) + (this.z / value.array[ 8]) + (this.w / value.array[12]),
				(this.x / value.array[1]) + (this.y / value.array[5]) + (this.z / value.array[ 9]) + (this.w / value.array[13]),
				(this.x / value.array[2]) + (this.y / value.array[6]) + (this.z / value.array[10]) + (this.w / value.array[14]),
				(this.x / value.array[3]) + (this.y / value.array[7]) + (this.z / value.array[11]) + (this.w / value.array[15])
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector4 or Matrix44', 'divide', 'Vector4');
		}
		
		return this;
	},
	
	dot: function(vec4) {
		if(vec4 instanceof glacier.Vector4) {
			return ((this.x * vec4.x) + (this.y * vec4.y) + (this.z * vec4.z) + (this.w * vec4.w));
		}
		
		throw new glacier.exception.InvalidParameter('vec4', vec4, 'Vector4', 'dot', 'Vector4');
	},
	
	get length() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w));
	},
	
	maximize: function(max) {
		if(max instanceof glacier.Vector4) {
			this.x = Math.max(this.x, max.x);
			this.y = Math.max(this.y, max.y);
			this.z = Math.max(this.z, max.z);
			this.w = Math.max(this.w, max.w);
		} else {
			throw new glacier.exception.InvalidParameter('max', max, 'Vector4', 'minimize', 'Vector4');
		}
		
		return this;
	},
	
	minimize: function(min) {
		if(min instanceof glacier.Vector4) {
			this.x = Math.min(this.x, min.x);
			this.y = Math.min(this.y, min.y);
			this.z = Math.min(this.z, min.z);
			this.w = Math.min(this.w, min.w);
		} else {
			throw new glacier.exception.InvalidParameter('min', min, 'Vector4', 'minimize', 'Vector4');
		}
		
		return this;
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x *= value.x;
			this.y *= value.y;
			this.z *= value.z;
			this.w *= value.w;
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
			this.z *= value;
			this.w *= value;
		} else if(value instanceof glacier.Matrix44) {
			this.assign(
				(this.x * value.array[0]) + (this.y * value.array[4]) + (this.z * value.array[ 8]) + (this.w * value.array[12]),
				(this.x * value.array[1]) + (this.y * value.array[5]) + (this.z * value.array[ 9]) + (this.w * value.array[13]),
				(this.x * value.array[2]) + (this.y * value.array[6]) + (this.z * value.array[10]) + (this.w * value.array[14]),
				(this.x * value.array[3]) + (this.y * value.array[7]) + (this.z * value.array[11]) + (this.w * value.array[15])
			);
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector4 or Matrix44', 'multiply', 'Vector4');
		}
		
		return this;
	},
	
	normalize: function() {
		var inverted = 1.0 / this.length;
		
		this.x *= inverted;
		this.y *= inverted;
		this.z *= inverted;
		this.w *= inverted;
		
		return this;
	},
	
	get normalized() {
		return this.copy.normalize();
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Vector4) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
			this.w -= value.w;
		} else if(typeof value == 'number') {
			this.x -= value;
			this.y -= value;
			this.z -= value;
			this.w -= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number or Vector4', 'subtract', 'Vector4');
		}
		
		return this;
	},
	
	swap: function(vec4) {
		if(vec4 instanceof glacier.Vector4) {
			this.x = vec4.x + (vec4.x = this.x, 0);
			this.y = vec4.y + (vec4.y = this.y, 0);
			this.z = vec4.z + (vec4.z = this.z, 0);
			this.w = vec4.w + (vec4.w = this.w, 0);
		} else {
			throw new glacier.exception.InvalidParameter('vec4', vec4, 'Vector4', 'swap', 'Vector4');
		}
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')');
	},
	
	get xy() {
		return new glacier.Vector2(this.x, this.y);
	},
	
	get xyz() {
		return new glacier.Vector3(this.x, this.y, this.z);
	},
	
	get xyw() {
		return new glacier.Vector3(this.x, this.y, this.w);
	},
	
	get xz() {
		return new glacier.Vector2(this.x, this.z);
	},
	
	get xzw() {
		return new glacier.Vector3(this.x, this.z, this.w);
	},
	
	get xw() {
		return new glacier.Vector2(this.x, this.w);
	},
	
	get yz() {
		return new glacier.Vector2(this.y, this.z);
	},
	
	get yzw() {
		return new glacier.Vector3(this.y, this.z, this.w);
	},
	
	get yw() {
		return new glacier.Vector2(this.y, this.w);
	},
	
	get zw() {
		return new glacier.Vector2(this.z, this.w);
	}
};

glacier.GlobeScene = function GlobeScene(container, options) {
	// Call Scene constructor
	glacier.Scene.call(this, container, options);
	
	// Parse options with type-checking
	options = glacier.parseOptions(options, {
		background:		{ Color: glacier.color.BLACK, class: glacier.Color },
		latitudes:		{ number: 45, gt: 2 },
		longitudes:		{ number: 90, gt: 2 },
		radius:			{ number: 1.0, gt: 0.0 },
		color:			{ Color: glacier.color.BLUE, class: glacier.Color },
		rotationSpeed:	{ number: 0.0 },
		obliquity:		{ number: 0.0 },
		texture:		[ null, 'string' ],
		nightTexture:	[ null, 'string' ],
		normalMap:		[ null, 'string' ],
		mouseControl:	{ boolean: true }
	}, 'GlobeScene');
	
	var rotation = 0.0;
	
	Object.defineProperties(this, {
		base: { get: function() { return this.layers[0]; } },
		data: { value: {} },
		layers: { value: new glacier.TypedArray('Sphere', glacier.Sphere) },
		
		obliquity: {
			get: function() {
				return options.obliquity;
			},
			set: function(value) {
				if(typeof value == 'number') {
					options.obliquity = value;
				}
			}
		},
		rotation: {
			get: function() {
				return rotation;
			},
			set: function(value) {
				if(typeof value == 'number') {
					rotation = value;
				}
			}
		}
	});
	
	this.layers.push(new glacier.Sphere(options.latitudes, options.longitudes, options.radius));
	
	// Initialize base mesh and textures
	this.base.texture0 = options.texture;
	this.base.texture1 = options.nightTexture;
	this.base.texture2 = options.normalMap;
	this.base.init(this.context, { shader: 'globe' });
	
	// Set camera clip planes
	this.camera.clipNear = 0.01;
	this.camera.clipFar = 100.0;
	
	// Add angle and zoom properties to camera, and initialize following
	this.camera.angle = new glacier.Vector2(90, 0);
	this.camera.zoom = 2.0;
	this.camera.follow(this.camera.target, this.camera.angle, this.camera.zoom);
	
	// Bind view and projection matrices
	this.context.view = this.camera.matrix;
	this.context.projection = this.camera.projection;
	
	// Enable mouse controlling as required
	if(options.mouseControl) {
		this.bindMouse();
	}
	
	// Set context background color
	this.context.background = options.background;
	
	// Add draw callback
	this.addRunCallback(function() {
		var gl = this.context.gl, d;
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		this.context.clear();
		
		this.base.matrix.assignIdentity();
		//this.base.matrix.rotate(glacier.degToRad(-this.obliquity), 0, 0, 1);
		//this.base.matrix.rotate(glacier.degToRad(this.rotation), 0, 1, 0);
		this.base.draw();
		
		function drawData(data) {
			if(data instanceof glacier.Drawable) {
				data.matrix.assign(this.base.matrix);
				data.draw();
			} else if(typeof data == 'object') {
				if(data.drawables instanceof Array) {
					data.drawables.forEach(function(drawable) {
						drawData.call(this, drawable);
					}, this);
				}
			}
		}
		
		for(d in this.data) {
			drawData.call(this, this.data[d]);
		}
	});
};

// glacier.GlobeScene extends glacier.Scene
glacier.extend(glacier.GlobeScene, glacier.Scene, {
	addData: function(geoJson, color, callback) {
		var self = this, dataObject, drawables = {}, uid;
		
		function addDrawables(array, data) {
			if(data instanceof glacier.geoJSON.Feature) {
				addDrawables(array, data.geometry);
			} else if(data instanceof glacier.geoJSON.FeatureCollection) {
				data.features.forEach(function(feature) {
					addDrawables(array, feature);
				});
			} else if(data instanceof glacier.geoJSON.MultiPoint) {
				data.points.forEach(function(point) {
					addDrawables(array, point);
				});
			} else if(data instanceof glacier.geoJSON.Point) {
				if(!drawables.hasOwnProperty('points')) {
					drawables.points = array.push(new glacier.PointCollection()) - 1;
				}
				
				array[drawables.points].addPoint(
					self.latLngToPoint(new glacier.Vector2(data.lng, data.lat), data.alt),
					(color instanceof glacier.Color ? color : glacier.color.WHITE)
				);
			}
		}
		
		if(typeof geoJson == 'string') {
			glacier.load(geoJson, function(data) {
				self.addData(JSON.parse(data), color, callback);
			});
		} else if(typeof geoJson == 'object') {
			if((data = glacier.geoJSON.parse(geoJson))) {
				dataObject = self.data[(uid = glacier.generateUID())] = {
					geoJSON: data,
					drawables: [],
					hide: function() {
						this.drawables.forEach(function(drawable) {
							if(drawable instanceof glacier.Drawable) {
								drawable.visible = false;
							}
						});
					},
					show: function() {
						this.drawables.forEach(function(drawable) {
							if(drawable instanceof glacier.Drawable) {
								drawable.visible = true;
							}
						});
					}
				};
				
				addDrawables(dataObject.drawables, data);
				
				dataObject.drawables.forEach(function(drawable) {
					if(drawable instanceof glacier.Drawable) {
						drawable.init(self.context);
					}
				});
				
				if(typeof callback == 'function') {
					callback(uid, dataObject);
				}
			}
		} else {
			throw new glacier.exception.InvalidParameter('geoJson', geoJson, 'geoJSON object or URL as string', 'addData', 'GlobeScene');
		}
	},
	
	bindMouse: function(options) {
		var self = this, camUpdate, c, latLng;
		
		self.unbindMouse();
		
		function easeIn(pos, min, max, len) {
			return (max - min) * Math.pow(2, 10 * (pos / len - 1)) + min;
		}
		
		function easeOut(pos, initial, target, len) {
			return (target - initial) * (-Math.pow(2, -10 * pos / len) + 1) + initial;
		}
		
		// Parse options with type-checking
		options = glacier.parseOptions(options, { 
			zoomMin:		{ number: 1.01, gt: 0.0 },
			zoomMax:		{ number: 10.0, gt: 0.0 },
			zoomSteps:		{ number: 30, gt: 0 },
		});
		
		self.camera.zoom = options.zoomMax;
		
		self.mouseHandler = {
			target: new glacier.Vector3(0, 0, 0),
			angleVelocity: null,
			zoomStep: options.zoomSteps,
			
			callbacks: {
				mousedown: function(event) {
					if(event.button === 0) {	// Left mouse for rotation
						self.mouseHandler.clickLatLng = self.screenToLatLng(event.clientX, event.clientY);
						self.mouseHandler.angleVelocity = null;
					}
				},
				mouseup: function(event) {
					if(event.button === 0) {	// Left mouse for rotation
						self.mouseHandler.clickLatLng = null;
						
						if(self.mouseHandler.deltaLatLng) {
							self.mouseHandler.angleVelocity = {
								initial: self.mouseHandler.deltaLatLng.copy,
								current: new glacier.Vector2(0, 0),
								dtime: 0.0
							};
						}
					}
				},
				mousemove: function(event) {
					if((latLng = self.screenToLatLng(event.clientX, event.clientY))) {
						self.context.canvas.style.cursor = 'move';
						
						if(self.mouseHandler.clickLatLng) {
							self.mouseHandler.deltaLatLng = latLng.subtract(self.mouseHandler.clickLatLng);
							self.camera.angle.subtract(self.mouseHandler.deltaLatLng);
							camUpdate();
						}
					} else {
						self.context.canvas.style.cursor = 'default';
						self.mouseHandler.deltaLatLng = null;
					}
				},
				touchend: function(event) {
					self.mouseHandler.clickLatLng = null;
					
					if(self.mouseHandler.deltaLatLng) {
						self.mouseHandler.angleVelocity = {
							initial: self.mouseHandler.deltaLatLng.copy,
							current: new glacier.Vector2(0, 0),
							dtime: 0.0
						};
					}
					
					event.preventDefault();
				},
				touchmove: function(event) {
					if(event.touches.length == 1) {
						var touch = event.touches[0];
						
						if((latLng = self.screenToLatLng(event.clientX, event.clientY))) {
							if(self.mouseHandler.clickLatLng) {
								self.mouseHandler.deltaLatLng = latLng.subtract(self.mouseHandler.clickLatLng);
								self.camera.angle.subtract(self.mouseHandler.deltaLatLng);
								camUpdate();
							}
						} else {
							self.mouseHandler.deltaLatLng = null;
						}
					}
					
					event.preventDefault();
				},
				touchstart: function(event) {
					if(event.touches.length == 1) {
						var touch = event.touches[0];
						
						self.mouseHandler.clickLatLng = self.screenToLatLng(event.clientX, event.clientY);
						self.mouseHandler.angleVelocity = null;
					}
					
					event.preventDefault();
				},
				wheel: function(event) {
					if(event.deltaY) {
						self.mouseHandler.zoomStep = glacier.clamp(self.mouseHandler.zoomStep + (event.deltaY > 0 ? 1 : -1), -options.zoomSteps, options.zoomSteps);
						self.camera.zoom = easeIn(self.mouseHandler.zoomStep, options.zoomMin, options.zoomMax, options.zoomSteps);
						camUpdate();
					}
				}
			},
			
			camEaseCallback: function(dtime) {
				if(self.mouseHandler.angleVelocity) {
					var velocity = self.mouseHandler.angleVelocity, length = velocity.initial.length;
					
					velocity.current.x = easeOut((velocity.dtime += dtime), velocity.initial.x, 0.0, length);
					velocity.current.y = easeOut((velocity.dtime += dtime), velocity.initial.y, 0.0, length);
					self.camera.angle.subtract(velocity.current);
					
					camUpdate();
					
					if(glacier.compare(velocity.current.length, 0.0)) {
						self.mouseHandler.angleVelocity = null;
					}
				}
			}
		};
			
		(camUpdate = function() {
			self.camera.angle.x = glacier.limitAngle(self.camera.angle.x, -180, 180);
			self.camera.angle.y = glacier.clamp(self.camera.angle.y, -89.99, 89.99);
			self.camera.follow(self.mouseHandler.target, self.camera.angle, self.camera.zoom);
		}).call();
			
		for(c in self.mouseHandler.callbacks) {
			if(self.mouseHandler.callbacks.hasOwnProperty(c) && typeof self.mouseHandler.callbacks[c] == 'function') {
				self.context.canvas.addEventListener(c, self.mouseHandler.callbacks[c]);
			}
		}
		
		self.addRunCallback(self.mouseHandler.camEaseCallback);
	},
	
	focus: function(latLng, callback) {
		if(!(latLng instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('latLng', latLng, 'Vector2', 'focus', 'GlobeScene');
		}
		
		function easeInOut(t, b, c, d) {
			var f = ((t /= (d / 2)) < 1 ? Math.pow(2, 10 * --t) : -Math.pow(2, -10 * --t) + 2) || 0;
			return new glacier.Vector2((c.x / 2) * f + b.x, (c.y / 2) * f + b.y);
		}
		
		var self = this, focusUpdate, step = 0, steps, start = self.camera.angle.copy, vec2 = latLng.copy;
		vec2.lng += 90.0;
		
		if(self.mouseHandler) {
			self.camera.angle.assign(vec2);
			self.mouseHandler.target.assign(self.camera.target);
		}
		
		steps = start.distance(vec2);
		vec2.subtract(start);
		
		(focusUpdate = function() {
			self.camera.follow(self.camera.target, self.camera.angle.assign(easeInOut(step, start, vec2, steps)), self.camera.zoom);
			
			if(++step < steps) {
				requestAnimationFrame(focusUpdate);
			} else if(typeof callback == 'function') {
				callback(latLng);
			}
		}).call();
	},
	
	latLngToPoint: function(latLng, alt) {
		if(!(latLng instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('latLng', latLng, 'Vector2', 'latLngToPoint', 'GlobeScene');
		}
		
		if(alt !== undefined && (typeof alt != 'number')) {
			throw new glacier.exception.InvalidParameter('alt', alt, 'number', 'latLngToPoint', 'GlobeScene');
		}
		
		var theta = glacier.degToRad(latLng.lat), phi = glacier.degToRad(latLng.lng);
		
		// Altitude based on equatorial radius in WGS-84	
		alt = 1.0 + ((alt || 0) * (1.0 / 6378137));
		
		return new glacier.Vector3(
			alt * this.base.radius * -Math.cos(theta) * Math.cos(phi),
			alt * this.base.radius *  Math.sin(theta),
			alt * this.base.radius *  Math.cos(theta) * Math.sin(phi)
		);
	},
	
	latLngToScreen: function(latLng, alt) {
		return this.context.worldToScreen(this.latLngToPoint(latLng, alt).multiply(this.base.matrix));
	},
	
	pointToLatLng: function(point) {
		if(!(point instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('point', point, 'Vector3', 'worldToLatLng', 'GlobeScene');
		}
		
		return new glacier.Vector2(
			((270.0 + glacier.radToDeg(Math.atan2(point.x, point.z))) % 360) - 180.0,
			90.0 - glacier.radToDeg(Math.acos(point.y / this.base.radius))
		);
	},
	
	rayCast: function(xOrVec2, y) {
		if(xOrVec2 instanceof glacier.Vector2) {
			return this.rayCast(xOrVec2.x, xOrVec2.y);
		} else {
			var args = [ 'x', 'y' ];
			
			[ xOrVec2, y ].forEach(function(arg, index) {
				if(isNaN(arg)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'rayCast', 'GlobeScene');
				}
			});
		}
			
		var ndc = new glacier.Vector3(
			2.0 * (xOrVec2 / this.context.width) - 1.0,
			1.0 - 2.0 * (y / this.context.height),
			1.0
		), eye, pos, intersection;
		
		eye = this.camera.position.copy;
		pos = new glacier.Vector4(ndc).multiply(this.camera.projection.inverse).multiply(this.camera.matrix.inverse);
		
		return new glacier.Ray(eye, pos.divide(pos.w).xyz);
	},
	
	screenToLatLng: function(xOrVec2, y) {
		var intersection, ray = this.rayCast(xOrVec2, y);
		
		if((intersection = ray.intersects(this.base))) {
			intersection.multiply(this.base.matrix.inverse);
			return this.pointToLatLng(intersection);
		}
		
		return null;
	},
	
	unbindMouse: function() {
		var self = this, c;
		
		if(self.mouseHandler) {
			for(c in self.mouseHandler.callbacks) {
				if(self.mouseHandler.callbacks.hasOwnProperty(c) && typeof self.mouseHandler.callbacks[c] == 'function') {
					self.context.canvas.removeEventListener(c, self.mouseHandler.callbacks[c]);
					self.mouseHandler.callbacks[c] = null;
				}
			}
			
			self.removeRunCallback(self.mouseHandler.camEaseCallback);
		}
		
		self.mouseHandler = null;
		self.context.canvas.style.cursor = 'default';
	},
});

/* Index Limits
6 * 10922 = 65532
104^2 * 6 = 64896
(90*0.8)*(180*0.8)*6=62208
*/

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
				glacier.error.invalidAssignment('radius', value, 'positive number', 'Sphere');
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
