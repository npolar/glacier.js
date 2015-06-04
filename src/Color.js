glacier.Color = function Color(params) {
	var a, args, vals, value = 0x000000FF; // rgba
	
	Object.defineProperties(this, {
		r: {
			get: function() {
				return ((value >> 24) & 0xFF);
			},
			set: function(red) {
				if(typeof red == 'number' && red >= 0 && red <= 255) {
					value = (((red & 0xFF) << 24) + (value & 0x00FFFFFF)) >>> 0;
				} else {
					glacier.error.invalidAssignment('r', red, 'number between 0 and 255', 'Color');
				}
			}
		},
		g: {
			get: function() {
				return ((value >> 16) & 0xFF);
			},
			set: function(green) {
				if(typeof green == 'number' && green >= 0 && green <= 255) {
					value = (((green & 0xFF) << 16) + (value & 0xFF00FFFF)) >>> 0;
				} else {
					glacier.error.invalidAssignment('g', green, 'number between 0 and 255', 'Color');
				}
			}
		},
		b: {
			get: function() {
				return ((value >> 8) & 0xFF);
			},
			set: function(blue) {
				if(typeof blue == 'number' && blue >= 0 && blue <= 255) {
					value = (((blue & 0xFF) << 8) + (value & 0xFFFF00FF)) >>> 0;
				} else {
					glacier.error.invalidAssignment('b', blue, 'number between 0 and 255', 'Color');
				}
			}
		},
		a: {
			get: function() {
				return (((value >> 0) & 0xFF) / 255.0);
			},
			set: function(alpha) {
				if(typeof alpha == 'number' && alpha >= 0.0 && alpha <= 1.0) {
					value = ((((alpha * 255) & 0xFF) << 0) + (value & 0xFFFFFF00)) >>> 0;
				} else {
					glacier.error.invalidAssignment('a', alpha, 'number between 0.0 and 1.0', 'Color');
				}
			}
		},
		rgb: {
			get: function() {
				return ((value >> 8) & 0xFFFFFF);
			},
			set: function(rgb) {
				if(typeof rgb == 'number' && rgb >= 0x00 && rgb <= 0xFFFFFF) {
					value = (((rgb & 0xFFFFFF) << 8) + (value & 0xFF)) >>> 0;
				} else if(glacier.isArray(rgb)) {
					for(a = 0, vals = []; a < rgb.length; ++a) {
						if(typeof rgb[a] == 'number' && rgb[a] >= 0.0 && rgb[a] <= 1.0) {
							vals.push(rgb[a]);
						} else break;
					}
					
					if(vals.length == 3) {
						this.rgb = (((vals[0] * 255) << 16) + ((vals[1] * 255) << 8) + (vals[2] * 255)) >>> 0;
					} else {
						glacier.error.invalidAssignment('rgb', '[' + rgb.join(', ') + ']', 'array[3] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgb = (typeof rgb == 'number' ? '0x' + rgb.toString(16).toUpperCase() : rgb);
					glacier.error.invalidAssignment('rgb', rgb, 'RGB as 24-bits integer or array[3] of numbers between 0.0 and 1.0', 'Color');
				}
			}
		},
		rgba: {
			get: function() {
				return value;
			},
			set: function(rgba) {
				if(typeof rgba == 'number' && rgba >= 0x00 && rgba <= 0xFFFFFFFF) {
					value = (rgba & 0xFFFFFFFF) >>> 0;
				} else if(glacier.isArray(rgba)) {
					for(a = 0, vals = []; a < rgba.length; ++a) {
						if(typeof rgba[a] == 'number' && rgba[a] >= 0.0 && rgba[a] <= 1.0) {
							vals.push(rgba[a]);
						} else break;
					}
					
					if(vals.length == 4) {
						this.rgba = (((vals[0] * 255) << 24) + ((vals[1] * 255) << 16) + ((vals[2] * 255) << 8) + (vals[3] * 255)) >>> 0;
					} else {
						glacier.error.invalidAssignment('rgba', '[' + rgba.join(', ') + ']', 'array[4] of numbers between 0.0 and 1.0', 'Color');
					}
				} else {
					rgba = (typeof rgba == 'number' ? '0x' + rgba.toString(16).toUpperCase() : rgba);
					glacier.error.invalidAssignment('rgba', rgb, 'RGBA as 32-bits integer or array[4] of numbers between 0.0 and 1.0', 'Color');
				}
			}
		}
	});
	
	if(params instanceof glacier.Color) {
		this.rgba = params.rgba;
	} else if(glacier.isArray(params)) {
		this.rgba = params;
	} else switch((args = arguments).length) {
		case 1: // (rgb)
			this.rgb = args[0];
			break;
		
		case 2:	// (rgb, a)
			this.rgb = args[0];
			this.a = args[1];
			break;
		
		case 3: // (r, g, b)
		case 4: // (r, g, b, a)
			for(a = 0, vals = []; a < args.length; ++a) {
				if(typeof args[a] == 'number') {
					vals.push(args[a] / (a < 3 ? 255 : 1));
				} else {
					throw new glacier.exception.InvalidParameter(args[a], args[a], 'number', '(constructor)', 'Color');
				}
			}
			
			while(vals.length < 4) {
				vals.push(1.0);
			}
			
			this.rgba = vals;
			break;
		
		default:
	}
};

glacier.Color.prototype = {
	get array() {
		return new Float32Array([ this.r / 255.0, this.g / 255.0, this.b / 255.0, this.a ]);
	},
	
	assign: function(rOrColor, g, b, a) {
		if(rOrColor instanceof glacier.Color) {
			this.rgba = rOrColor.rgba;
		} else {
			var args = [ 'r', 'g', 'b' ], r = rOrColor;
			
			[ r, g, b ].forEach(function(arg, index) {
				if(typeof arg != 'number' || arg < 0 || arg > 255) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number between 0 and 255', 'assign', 'Color');
				}
			});
			
			if(a || a === 0.0) {
				if(typeof a != 'number' || a < 0.0 || a > 1.0) {
					throw new glacier.exception.InvalidParameter('a', a, 'number between 0.0 and 1.0', 'assign', 'Color');
				}
			}
			
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = (a || a === 0.0 ? a : 1.0);
		}
		
		return this;
	},
	
	get copy() {
		return new glacier.Color(this);
	},
	
	invert: function() {
		this.rgb = (0xFFFFFF - this.rgb);
		return this;
	},
	
	get inverted() {
		return this.copy.invert();
	},
	
	toHtmlString: function(background) {
		var color = this.copy, str = '#', hex;
		
		if(color.a < 1.0) {
			background = (background instanceof glacier.Color ? background : glacier.color.WHITE);
			
			color.r = (color.r * color.a) + ((1.0 - color.a) * background.r);
			color.g = (color.g * color.a) + ((1.0 - color.a) * background.g);
			color.b = (color.b * color.a) + ((1.0 - color.a) * background.b);
			color.a = 1.0;
		}
		
		return '#' +
			('0' + color.r.toString(16)).slice(-2) +
			('0' + color.g.toString(16)).slice(-2) +
			('0' + color.b.toString(16)).slice(-2);
	},
	
	toString: function() {
		return 'rgba(' + [ this.r, this.g, this.b, this.a.toFixed(2) ].join(', ') + ')';
	}
};

// Pre-defined colors
glacier.color = {
	get WHITE()		{ return new glacier.Color(0xFFFFFF, 1.0); },
	get SILVER()	{ return new glacier.Color(0xC0C0C0, 1.0); },
	get GRAY()		{ return new glacier.Color(0x808080, 1.0); },
	get BLACK()		{ return new glacier.Color(0x000000, 1.0); },
	get RED()		{ return new glacier.Color(0xFF0000, 1.0); },
	get MAROON()	{ return new glacier.Color(0x800000, 1.0); },
	get YELLOW()	{ return new glacier.Color(0xFFFF00, 1.0); },
	get OLIVE()		{ return new glacier.Color(0x808000, 1.0); },
	get LIME()		{ return new glacier.Color(0x00FF00, 1.0); },
	get GREEN()		{ return new glacier.Color(0x008000, 1.0); },
	get AQUA()		{ return new glacier.Color(0x00FFFF, 1.0); },
	get TEAL()		{ return new glacier.Color(0x008080, 1.0); },
	get BLUE()		{ return new glacier.Color(0x0000FF, 1.0); },
	get NAVY()		{ return new glacier.Color(0x000080, 1.0); },
	get FUCHSIA()	{ return new glacier.Color(0xFF00FF, 1.0); },
	get PURPLE()	{ return new glacier.Color(0x800080, 1.0); }
};
