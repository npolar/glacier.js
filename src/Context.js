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
	
	if(!((context = canvas.getContext('webgl')) instanceof WebGLRenderingContext)) {
		throw new glacier.exception.ContextError('WebGL is not supported', '(constructor)', 'Context');
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
					throw new glacier.exception.InvalidAssignment('view', value, 'Matrix44 or null', 'Context');
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
