glacier.ShaderBank = function ShaderBank(context) {
	if(!(context instanceof glacier.Context)) {
		throw new glacier.exception.InvalidParameter('context', typeof context, 'Context', '(constructor)', 'ShaderBank');
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
			throw new glacier.exception.InvalidParameter('shader', typeof shader, 'string', 'shader', 'ShaderBank');
		}
		
		if((shader = this.shaders[shader]) instanceof glacier.Shader) {
			return shader;
		}
		
		return null;
	}
};
