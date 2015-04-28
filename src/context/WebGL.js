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
	},
	worldToScreen: function(point, modelView) {
		if(point instanceof glacier.Vector3) {
			var matrix, vec4;
			
			if(!modelView || (modelView instanceof glacier.Matrix44)) {
				matrix = new glacier.Matrix44(modelView || null);
			} else {
				throw new glacier.exception.InvalidParameter('modelView', typeof modelView, 'Matrix44 or null', 'worldToScreen', 'context.WebGL');
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
			throw new glacier.exception.InvalidParameter('point', typeof point, 'Vector3', 'worldToScreen', 'context.WebGL');
		}
		
		return null;
	}
});
