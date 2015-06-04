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
			} else if(normals) {
				throw new glacier.exception.InvalidParameter('texCoords', texCoords, 'Vector2 array', 'init', 'BufferObject');
			}
			
			// Vertex Color buffer
			if(glacier.isArray(colors, glacier.Color)) {
				if(colors.length) {
					array = [];
					colors.forEach(function(color) { array.push(color.r / 255, color.g  / 255, color.b  / 255, color.a); });
					gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.color = gl.createBuffer()));
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				}
			} else if(normals) {
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
