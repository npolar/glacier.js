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
			
			// TODO: defaultProgram (using default shaders)
			this.defaultProgram = 'not implemented';
			
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
	draw: function(drawable) {
		if(drawable instanceof glacier.Drawable) {
			if(drawable.contextData instanceof glacier.context.WebGL.Drawable) {
				drawable.contextData.draw();
			}
		}
	},
	init: function(drawable, options) {
		if(drawable instanceof glacier.Mesh) {
			var program, data, self = this;
			
			if(typeof options == 'object') {
				program = (options.program instanceof WebGLProgram ? options.program : this.defaultProgram);
			}
			
			data = new glacier.context.WebGL.Drawable(this, this.gl.TRIANGLES, program);
			
			if(data.init(drawable.vertices, drawable.indices, drawable.normals, drawable.texCoords, drawable.colors)) {
				
				drawable.texture.onLoad(function(image) { data.textures.base = self.createTexture(image); });
				drawable.alphaMap.onLoad(function(image) { data.textures.alpha = self.createTexture(image); });
				drawable.normalMap.onLoad(function(image) { data.textures.normal = self.createTexture(image); });
				drawable.specularMap.onLoad(function(image) { data.textures.specular = self.createTexture(image); });
				drawable.contextData = data;
				
				return true;
			}
			
			return false;
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

glacier.context.WebGL.Drawable = function(context, drawMode, program) {
	if(!(context instanceof glacier.context.WebGL)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'context', value: typeof context, expected: 'context.WebGL', method: 'context.WebGL.Drawable constructor' });
		return;
	}
	
	var gl = context.gl, modes = [ gl.POINTS, gl.LINE_STRIP, gl._LINE_LOOP, gl.LINES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN, gl.TRIANGLES ];
	
	if(modes.indexOf(drawMode) == -1) {
		glacier.error('INVALID_PARAMETER', { parameter: 'drawMode', value: drawMode, expected: 'valid WebGL draw mode', method: 'context.WebGL.Drawable constructor' });
		return;
	}
	
	if(program && !(program instanceof WebGLProgram)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'program', value: typeof program, expected: 'WebGLProgram', method: 'context.WebGL.Drawable constructor' });
		return;
	}
	
	Object.defineProperties(this, {
		attributes:	{ value: {} },
		buffers:	{ value: {} },
		context:	{ value: context },
		drawMode:	{ value: drawMode },
		elements:	{ value: 0, configurable: true },
		textures:	{ value: {} },
		uniforms:	{ value: {} },
		
		program: {
			get: function() {
				return program;
			},
			set: function(value) {
				if(value instanceof WebGLProgram) {
					program = value;
					
					this.attributes.vertex_xyz	= gl.getAttribLocation(program, 'vertex_xyz');
					this.attributes.normal_xyz	= gl.getAttribLocation(program, 'normal_xyz');
					this.attributes.texture_uv	= gl.getAttribLocation(program, 'texture_uv');
					this.attributes.color_rgba	= gl.getAttribLocation(program, 'color_rgba');
					
					this.uniforms.tex_samp_0	= gl.getUniformLocation(program, 'tex_samp_0');
					this.uniforms.tex_samp_1	= gl.getUniformLocation(program, 'tex_samp_1');
					this.uniforms.tex_samp_2	= gl.getUniformLocation(program, 'tex_samp_2');
					this.uniforms.tex_samp_3	= gl.getUniformLocation(program, 'tex_samp_3');
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'context.WebGL.Drawable.program', value: typeof value, expected: 'WebGLProgram' });
				}
			}
		}
	});
	
	this.program = (program || context.defaultProgram);
};

glacier.context.WebGL.Drawable.prototype = {
	draw: function() {
		if(this.context && this.program) {
			var f32bpe = Float32Array.BYTES_PER_ELEMENT, gl = this.context.gl;
			
			gl.useProgram(this.program);
				
			if(this.buffers.color && this.attributes.color_rgba >= 0) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
				gl.enableVertexAttribArray(this.attributes.color_rgba);
				gl.vertexAttribPointer(this.attributes.color_rgba, 4, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.texCoord && this.attributes.texture_uv >= 0) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoord);
				gl.enableVertexAttribArray(this.attributes.texture_uv);
				gl.vertexAttribPointer(this.attributes.texture_uv, 2, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.normal && this.attributes.normal_xyz >= 0) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
				gl.enableVertexAttribArray(this.attributes.normal_xyz);
				gl.vertexAttribPointer(this.attributes.normal_xyz, 3, gl.FLOAT, false, 0, 0);
			}
			
			if(this.buffers.vertex && this.attributes.vertex_xyz >= 0) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
				gl.enableVertexAttribArray(this.attributes.vertex_xyz);
				gl.vertexAttribPointer(this.attributes.vertex_xyz, 3, gl.FLOAT, false, 0, 0);
			}
			
			[ 'base', 'alpha', 'normal', 'specular' ].forEach(function(tex, index) {
				if(this.textures[tex] instanceof WebGLTexture && this.uniforms['tex_samp_' + index]) {
					gl.activeTexture(gl.TEXTURE0 + index);
					gl.bindTexture(gl.TEXTURE_2D, this.textures[tex]);
					gl.uniform1i(this.uniforms['tex_samp_' + index], index);
				}
			}, this);
			
			if(this.buffers.index) {
				gl.drawElements(this.drawMode, this.elements, gl.UNSIGNED_SHORT, 0);
			} else {
				// TODO: gl.drawArrays(this.drawMode, 0, this.elements);
			}
		}
	},
	init: function(vertices, indices, normals, texCoords, colors) {
		if(this.context && this.program) {
			var gl = this.context.gl, array;
			
			if(glacier.isArray(vertices, glacier.Vector3)) {
				array = [];
				vertices.forEach(function(vertex) { array.push(vertex.x, vertex.y, vertex.z); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.vertex = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(vertices) {
				glacier.error('INVALID_PARAMETER', { parameter: 'vertices', value: typeof vertices, expected: 'Vector3 array', method: 'context.WebGL.Drawable.init' });
				return false;
			}
			
			if(glacier.isArray(indices, 'number')) {
				array = [];
				indices.forEach(function(index) { array.push(index); });
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (this.buffers.index = gl.createBuffer()));
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
				Object.defineProperty(this, 'elements', { value: array.length });
			} else if(indices) {
				glacier.error('INVALID_PARAMETER', { parameter: 'indices', value: typeof indices, expected: 'number array', method: 'context.WebGL.Drawable.init' });
				return false;
			}
			
			if(glacier.isArray(normals, glacier.Vector3)) {
				array = [];
				normals.forEach(function(normal) { array.push(normal.x, normal.y, normal.z); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.normal = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'normals', value: typeof normals, expected: 'Vector3 array', method: 'context.WebGL.Drawable.init' });
				return false;
			}
			
			if(glacier.isArray(texCoords, glacier.Vector2)) {
				array = [];
				texCoords.forEach(function(texCoord) { array.push(texCoord.u, texCoord.v); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.texCoord = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'texCoords', value: typeof texCoords, expected: 'Vector2 array', method: 'context.WebGL.Drawable.init' });
				return false;
			}
			
			if(glacier.isArray(colors, glacier.Color)) {
				array = [];
				colors.forEach(function(color) { array.push(color.r, color.g, color.b, color.a); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.color = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'colors', value: typeof colors, expected: 'Color array', method: 'context.WebGL.Drawable.init' });
				return false;
			}
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
			
			[ 'base', 'alpha', 'normal', 'specular' ].forEach(function(tex, index) {
				if(this.textures[tex] instanceof WebGLTexture) {
					gl.deleteTexture(this.textures[tex]);
					delete this.textures[tex];
				}
			}, this);
		}
	}
};
