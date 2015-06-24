glacier.shaders = {
	
	// highp:	vertex positions, uv coordinates
	// mediump:	normals, lighting related vectors
	// lowp:	colors
	
	vertex: {
		generic: [
			'attribute highp vec3 vertex_position;',
			'attribute mediump vec3 vertex_normal;',
			'attribute lowp vec4 vertex_color;',
			'attribute highp vec2 vertex_uv;',
			'uniform highp mat4 matrix_mvp;',
			'uniform lowp vec4 color_rgba;',
			'varying highp vec4 vertex_pos;',
			'varying mediump vec3 mvp_normal;',
			'varying lowp vec4 frag_color;',
			'varying highp vec2 tex_coords;',
			'void main()',
			'{',
				'gl_PointSize = 2.0;',
				'gl_Position = vertex_pos = matrix_mvp * vec4(vertex_position, 1.0);',
				'mvp_normal = normalize(matrix_mvp * vec4(vertex_normal, 1.0)).xyz;',
				'frag_color = vertex_color + color_rgba;',
				'tex_coords = vertex_uv;',
			'}'
		]
	},
	fragment: {
		generic: [
			'varying lowp vec4 frag_color;',
			'void main()',
			'{',
				'gl_FragColor = frag_color;',
			'}'
		],
		globe: [
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'uniform sampler2D tex_samp_2;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
			'varying mediump vec3 mvp_normal;',
			'void main()',
			'{',
				'vec3 lightPos = normalize(vec3(-28.0, 2.0, 12.0));',
				'vec3 normal = normalize(texture2D(tex_samp_2, tex_coords).rgb * 2.0 - 1.0);',
				'float diffuse = max(dot(mvp_normal, lightPos), 0.0);',
				'vec3 dayColor = texture2D(tex_samp_0, tex_coords).rgb * diffuse;',
				'vec3 nightColor = texture2D(tex_samp_1, tex_coords).rgb * (1.0 - diffuse);',
				'vec3 normalColor = dayColor * max(dot(normal, lightPos), 0.3);',
				'dayColor = ((1.0 - nightColor) * dayColor) + normalColor;',
				'gl_FragColor = vec4(dayColor + ((1.0 - dayColor) * nightColor * 0.5), 1.0);',
			'}'
		],
		normalMapped: [
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'uniform sampler2D tex_samp_1;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
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
			'precision highp float;',
			'uniform sampler2D tex_samp_0;',
			'varying highp vec2 tex_coords;',
			'varying lowp vec4 frag_color;',
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
