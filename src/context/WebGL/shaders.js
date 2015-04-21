glacier.context.WebGL.shaders = {
	vertex: {
		general: [
			'attribute highp vec3 vertex_xyz;',
			'attribute highp vec3 normal_xyz;',
			'attribute highp vec2 texture_uv;',
			'attribute highp vec4 color_rgba;',
			'uniform highp mat4 matrix_mvp;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_Position = matrix_mvp * vec4(vertex_xyz, 1.0);',
				'tex_coords = texture_uv; frag_color = color_rgba;',
			'}'
		]
	},
	fragment: {
		textured: [
			'precision mediump float;',
			'uniform sampler2D sampler_texture;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = texture2D(sampler_texture, tex_coords);',
			'}'
		],
		normalMapped: [
			'precision mediump float;',
			'uniform sampler2D sampler_texture;',
			'uniform sampler2D sampler_normal_map;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(1.0, 1.0, 1.0));',
				'vec4 fragColor = vec4(1.0, 1.0, 1.0, 1.0);',
				'vec3 normal = normalize(texture2D(sampler_normal_map, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(normal, lightPos), 0.0);',
				'gl_FragColor = vec4(diffuse * texture2D(sampler_texture, tex_coords).rgb, 1.0);',
			'}'
		]
	},
	programs: {
		textured: { vertex: 'general', fragment: 'textured' },
		normalMapped: { vertex: 'general', fragment: 'normalMapped' }
	}
};
