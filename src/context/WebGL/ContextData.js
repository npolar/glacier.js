glacier.context.WebGL.ContextData = function(drawable, context, drawMode, shader) {
	if(!(drawable instanceof glacier.Drawable)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'drawable', value: typeof drawable, expected: 'Drawable', method: 'context.WebGL.ContextData constructor' });
		return;
	}
	
	if(!(context instanceof glacier.context.WebGL)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'context', value: typeof context, expected: 'context.WebGL', method: 'context.WebGL.ContextData constructor' });
		return;
	}
	
	var gl = context.gl, modes = [ gl.POINTS, gl.LINE_STRIP, gl.LINE_LOOP, gl.LINES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN, gl.TRIANGLES ];
	
	if(modes.indexOf(drawMode) == -1) {
		glacier.error('INVALID_PARAMETER', { parameter: 'drawMode', value: drawMode, expected: 'valid WebGL draw mode', method: 'context.WebGL.ContextData constructor' });
		return;
	}
	
	if(!(shader instanceof glacier.context.WebGL.Shader)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'shader', value: typeof shader, expected: 'context.WebGL.Shader', method: 'context.WebGL.ContextData constructor' });
		return;
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
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'context.WebGL.ContextData.shader', value: typeof shader, expected: 'glacier.context.WebGL.Shader' });
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
				array = [];
				vertices.forEach(function(vertex) { array.push(vertex.x, vertex.y, vertex.z); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.vertex = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
				Object.defineProperty(this, 'elements', { value: array.length / 3 });
			} else if(vertices) {
				glacier.error('INVALID_PARAMETER', { parameter: 'vertices', value: typeof vertices, expected: 'Vector3 array', method: 'context.WebGL.ContextData.init' });
				return false;
			}
			
			if(glacier.isArray(indices, 'number')) {
				array = [];
				indices.forEach(function(index) { array.push(index); });
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (this.buffers.index = gl.createBuffer()));
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
				Object.defineProperty(this, 'elements', { value: array.length });
			} else if(indices) {
				glacier.error('INVALID_PARAMETER', { parameter: 'indices', value: typeof indices, expected: 'number array', method: 'context.WebGL.ContextData.init' });
				return false;
			}
			
			if(glacier.isArray(normals, glacier.Vector3)) {
				array = [];
				normals.forEach(function(normal) { array.push(normal.x, normal.y, normal.z); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.normal = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'normals', value: typeof normals, expected: 'Vector3 array', method: 'context.WebGL.ContextData.init' });
				return false;
			}
			
			if(glacier.isArray(texCoords, glacier.Vector2)) {
				array = [];
				texCoords.forEach(function(texCoord) { array.push(texCoord.u, texCoord.v); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.texCoord = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'texCoords', value: typeof texCoords, expected: 'Vector2 array', method: 'context.WebGL.ContextData.init' });
				return false;
			}
			
			if(glacier.isArray(colors, glacier.Color)) {
				array = [];
				colors.forEach(function(color) { array.push(color.r / 255, color.g  / 255, color.b  / 255, color.a); });
				gl.bindBuffer(gl.ARRAY_BUFFER, (this.buffers.color = gl.createBuffer()));
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
			} else if(normals) {
				glacier.error('INVALID_PARAMETER', { parameter: 'colors', value: typeof colors, expected: 'Color array', method: 'context.WebGL.ContextData.init' });
				return false;
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
