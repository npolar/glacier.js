glacier.context.WebGL.Shader = function(context, program) {
	if(!(context instanceof glacier.context.WebGL)) {
		throw new glacier.exception.InvalidParameter('context', typeof context, 'context.WebGL', '(constructor)', 'context.WebGL.Shader');
	}
	
	if(!(program instanceof WebGLProgram)) {
		throw new glacier.exception.InvalidParameter('program', typeof program, 'WebGLProgram', '(constructor)', 'context.WebGL.Shader');
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
			throw new glacier.exception.InvalidParameter('attributeArray', typeof attributeArray, 'string array', 'addAttributes', 'context.WebGL.Shader');
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
			throw new glacier.exception.InvalidParameter('uniformArray', typeof uniformArray, 'string array', 'addUniforms', 'context.WebGL.Shader');
		}
	},
	attribute: function(attribute) {
		if(typeof attribute != 'string') {
			throw new glacier.exception.InvalidParameter('attribute', typeof attribute, 'string', 'attribute', 'context.WebGL.Shader');
		}
		
		if(typeof (attribute = this.attributes[attribute]) == 'number') {
			return (attribute >= 0 ? attribute : null);
		}
		
		return null;
	},
	uniform: function(uniform) {
		if(typeof uniform != 'string') {
			throw new glacier.exception.InvalidParameter('uniform', typeof uniform, 'string', 'uniform', 'context.WebGL.Shader');
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
