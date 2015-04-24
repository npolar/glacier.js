glacier.context.WebGL = function WebGLContext(options) {
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
							glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.background', value: typeof color, expected: 'Color' });
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
		
		glacier.error('INVALID_PARAMETER', { parameter: 'drawable', value: typeof drawable, expected: 'Mesh', method: 'context.WebGL.init' });
		return false;
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
		
		var gl = this.gl, program = gl.createProgram();
		gl.attachShader(program, vertShader);
		gl.attachShader(program, fragShader);
		gl.linkProgram(program);
		
		if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: gl.getProgramInfoLog(program) });
			return null;
		}
		
		return program;
	},
	createShader: function(type, source) {
		if(!this.gl) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: 'uninitialized context' });
			return null;
		}
		
		var gl = this.gl, last, shader, valid = [ gl.FRAGMENT_SHADER, gl.VERTEX_SHADER ];
		
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
		
		shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		
		if(!gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: gl.getShaderInfoLog(shader) });
			return null;
		}
		
		return shader;
	},
	createTexture: function(image) {
		if(!this.gl) {
			glacier.error('CONTEXT_ERROR', { context: 'WebGL', error: 'uninitialized context' });
			return null;
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
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: 'image', value: typeof image, expected: 'Image', method: 'context.WebGL.createTexture' });
		}
		
		return null;
	}
});
