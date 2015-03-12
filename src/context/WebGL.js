glacier.context.WebGL = function(options) {
	options = (typeof options == 'object' ? options : {});
	
	var canvas, container, context;
	
	if(options.container instanceof HTMLElement) {
		container = options.container;
	} else if(typeof options.container == 'string') {
		if(!(container = document.getElementById(options.container))) {
			glacier.error('UNDEFINED_ELEMENT', { element: options.container, method: 'WebGL Context constructor' });
		}
	} else {
		glacier.error('MISSING_PARAMETER', { parameter: 'container', method: 'WebGL Context constructor' });
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
		Object.defineProperty(this, 'canvas', {
			value: canvas,
			writable: false
		});
		
		this.canvas.width	= canvas.offsetWidth;
		this.canvas.height	= canvas.offsetHeight;
		
		window.addEventListener('resize', function(event) {
			if(canvas.width != canvas.offsetWidth || canvas.height != canvas.offsetHeight) {
				this.resize(canvas.offsetWidth, canvas.offsetHeight);
			}
		}.bind(this));
		
		if((context = this.canvas.getContext('webgl'))) {
			Object.defineProperty(this, 'gl', {
				value: context,
				writable: false
			});
		}
		
		if(this.gl) {
			Object.defineProperty(this, 'background', {
				get: function() {
					var colors = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
					
					return (((colors[0] * 255) << 16) +
							((colors[1] * 255) <<  8) +
							((colors[2] * 255) <<  0)) >>> 0;
				},
				set: function(rgb) {
					if(typeof rgb == 'number') {
						var r = (((rgb >> 16) & 0xFF) / 255.0),
							g = (((rgb >>  8) & 0xFF) / 255.0),
							b = (((rgb >>  0) & 0xFF) / 255.0),
							a = 1.0;
						
						this.gl.clearColor(r, g, b, a);
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.background', value: rgb, expected: 'number' });
					}
				}
			});
		}
		
		this.background = glacier.color.BLACK;
		this.clear();
	}
};

glacier.context.WebGL.prototype = {
	clear: function() {
		if(this.gl) {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		}
	},
	resize:	function(width, height) {
		if(typeof width != 'number') {
			glacier.error('INVALID_PARAMETER', { parameter: 'width', expected: 'number', method: 'Context resize' });
			return;
		}
		
		if(typeof height != 'number') {
			glacier.error('INVALID_PARAMETER', { parameter: 'height', expected: 'number', method: 'Context resize' });
			return;
		}
		
		if(this.canvas) {
			this.canvas.width	= width;
			this.canvas.height	= height;
		}
		
		if(this.gl) {
			this.gl.viewport(0, 0, width, height);
		}
	}
};
