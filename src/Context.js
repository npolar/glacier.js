glacier.Context = function Context(canvas, options) {
	var background, context, element, projection = null;
	
	// Ensure canvas is a valid HTMLCanvasElement
	if(!(canvas instanceof HTMLCanvasElement)) {
		if(typeof canvas == 'string') {
			if((element = document.getElementById(canvas)) instanceof HTMLCanvasElement) {
				canvas = element;
			} else {
				throw new glacier.exception.InvalidParameter('canvas', canvas, 'string as HTMLCanvasElement ID', '(constructor)', 'Context');
			}
		} else {
			throw new glacier.exception.InvalidParameter('canvas', typeof canvas, 'HTMLCanvasElement or string', '(constructor)', 'Context');
		}
	}
	
	// Ensure options is a valid map (object)
	if(options && typeof options != 'object') {
		throw new glacier.exception.InvalidParameter('options', typeof canvas, 'object', '(constructor)', 'Context');
	} else if(!options) {
		options = {};
	}
	
	if(!((context = canvas.getContext('webgl')) instanceof WebGLRenderingContext)) {
		throw new glacier.exception.ContextError('WebGL is not supported', '(constructor)', 'Context');
	}
	
	// Define canvas, gl, height, projection and width members
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
					throw new glacier.exception.InvalidAssignment('background', color, 'Color', 'Context');
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
					throw new glacier.exception.InvalidAssignment('height', value, 'positive number', 'Context');
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
					throw new glacier.exception.InvalidAssignment('projection', value, 'Matrix44 or null', 'Context');
				}
			}
		},
		shaders: {
			value: new glacier.ShaderBank(this)
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
			throw new glacier.exception.InvalidParameter('drawable', typeof drawable, 'Drawable', 'init', 'Context');
		}
		
		return false;
	},
	resize:	function(width, height) {
		if(typeof width != 'number' || width <= 0.0) {
			throw new glacier.exception.InvalidParameter('width', typeof width, 'positive number', 'resize', 'Context');
		}
		
		if(typeof height != 'number' || height <= 0.0) {
			throw new glacier.exception.InvalidParameter('height', typeof height, 'positive number', 'resize', 'Context');
		}
		
		this.canvas.width	= width;
		this.canvas.height	= height;
		this.gl.viewport(0, 0, width, height);
	},
	createProgram: function(vertShader, fragShader) {
		if(!(vertShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('vertShader', typeof vertShader, 'WebGLShader', 'createProgram', 'Context');
		}
		
		if(!(fragShader instanceof WebGLShader)) {
			throw new glacier.exception.InvalidParameter('fragShader', typeof fragShader, 'WebGLShader', 'createProgram', 'Context');
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
			throw new glacier.exception.InvalidParameter('source', typeof source, 'string', 'createShader', 'Context');
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
		
		throw new glacier.exception.InvalidParameter('image', typeof image, 'Image', 'createTexture', 'Context');
	},
	worldToScreen: function(point, modelView) {
		if(point instanceof glacier.Vector3) {
			var matrix, vec4;
			
			if(!modelView || (modelView instanceof glacier.Matrix44)) {
				matrix = new glacier.Matrix44(modelView || null);
			} else {
				throw new glacier.exception.InvalidParameter('modelView', typeof modelView, 'Matrix44 or null', 'worldToScreen', 'Context');
			}
			
			if(this.projection instanceof glacier.Matrix44) {
				matrix.multiply(this.projection);
			}
			
			vec4 = {
				x: matrix.array[0] * point.x + matrix.array[4] * point.y + matrix.array[ 8] * point.z + matrix.array[12],
				y: matrix.array[1] * point.x + matrix.array[5] * point.y + matrix.array[ 9] * point.z + matrix.array[13],
				z: matrix.array[2] * point.x + matrix.array[6] * point.y + matrix.array[10] * point.z + matrix.array[14],
				w: matrix.array[3] * point.x + matrix.array[7] * point.y + matrix.array[11] * point.z + matrix.array[15]
			};
			
			if(vec4.w > 0.0) {
				vec4.x = (vec4.x /= vec4.w) * 0.5 + 0.5;
				vec4.y = (vec4.y /= vec4.w) * 0.5 + 0.5;
				vec4.z = (vec4.z /= vec4.w) * 0.5 + 0.5;
				
				return new glacier.Vector2(Math.round(vec4.x * context.width), Math.round((1.0 - vec4.y) * context.height));
			}
		} else {
			throw new glacier.exception.InvalidParameter('point', typeof point, 'Vector3', 'worldToScreen', 'Context');
		}
		
		return null;
	}
};
