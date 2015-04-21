glacier.context.WebGL.Shader = function(context, program) {
	if(!(context instanceof glacier.context.WebGL)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'context', value: typeof context, expected: 'context.WebGL', method: 'context.WebGL.Shader constructor' });
		return;
	}
	
	if(!(program instanceof WebGLProgram)) {
		glacier.error('INVALID_PARAMETER', { parameter: 'program', value: typeof program, expected: 'WebGLProgram', method: 'context.WebGL.Shader constructor' });
		return;
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
			glacier.error('INVALID_PARAMETER', { parameter: 'attributeArray', value: typeof attributeArray, expected: 'string array', method: 'glacier.WebGL.Shader.addAttributes' });
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
			glacier.error('INVALID_PARAMETER', { parameter: 'uniformArray', value: typeof uniformArray, expected: 'string array', method: 'glacier.WebGL.Shader.addUniforms' });
		}
	},
	attribute: function(attribute) {
		if(typeof attribute == 'string') {
			if(typeof (attribute = this.attributes[attribute]) == 'number') {
				return (attribute >= 0 ? attribute : null);
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: 'attribute', value: typeof attribute, expected: 'string', method: 'context.WebGL.Shader.attribute' });
		}
		
		return null;
	},
	uniform: function(uniform) {
		if(typeof uniform == 'string') {
			if((uniform = this.uniforms[uniform]) instanceof WebGLUniformLocation) {
				return uniform;
			}
		} else {
			glacier.error('INVALID_PARAMETER', { parameter: 'uniform', value: typeof uniform, expected: 'string', method: 'context.WebGL.Shader.uniform' });
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
