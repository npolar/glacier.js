glacier.context.WebGL.shaders = {
	vertex: {
		generic: [
			'attribute highp vec3 vertex_xyz;',
			'attribute highp vec3 normal_xyz;',
			'attribute highp vec2 texture_uv;',
			'attribute highp vec4 color_rgba;',
			'uniform highp mat4 matrix_mvp;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'gl_PointSize = 2.0;',
				'gl_Position = matrix_mvp * vec4(vertex_xyz, 1.0);',
				'tex_coords = texture_uv; frag_color = color_rgba;',
				'mvp_normal = normalize(matrix_mvp * vec4(normal_xyz, 1.0)).xyz;',
			'}'
		]
	},
	fragment: {
		generic: [
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = frag_color;',
			'}'
		],
		globe: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'uniform sampler2D tex_samp_2;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(-28.0, 2.0, 12.0));',
				'vec3 normal = normalize(texture2D(tex_samp_2, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(mvp_normal, lightPos), 0.0);',
				'vec3 dayColor = texture2D(tex_samp_0, tex_coords).rgb * diffuse;',
				'vec3 nightColor = texture2D(tex_samp_1, tex_coords).rgb * (1.0 - diffuse);',
				//'gl_FragColor = vec4(dayColor + nightColor, 1.0);',
				
				'gl_FragColor = vec4(nightColor + dayColor * max(dot(normal, lightPos), 0.3), 1.0);',
			'}'
		],
		normalMapped: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(1.0, 1.0, 1.0));',
				'vec4 fragColor = vec4(1.0, 1.0, 1.0, 1.0);',
				'vec3 normal = normalize(texture2D(tex_samp_1, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(normal, lightPos), 0.0);',
				'gl_FragColor = vec4(diffuse * texture2D(tex_samp_0, tex_coords).rgb, 1.0);',
			'}'
		],
		textured: [
			'precision mediump float;',
			'uniform sampler2D tex_samp_0;',
			'varying mediump vec2 tex_coords;',
			'varying mediump vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = texture2D(tex_samp_0, tex_coords);',
			'}'
		]
	},
	programs: {
		generic: { vertex: 'generic', fragment: 'generic' },
		globe: { vertex: 'generic', fragment: 'globe' },
		normalMapped: { vertex: 'generic', fragment: 'normalMapped' },
		textured: { vertex: 'generic', fragment: 'textured' }
	}
};
