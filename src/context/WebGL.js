glacier.context.WebGL = function(options) {
	options = (typeof options == 'object' ? options : {});
	
	var background, canvas, container, context;
	
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
					return background;
				},
				set: function(color) {
					if(color instanceof glacier.Color) {
						background = color;
						this.gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a);
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Context.background', value: typeof color, expected: 'Color' });
					}
				}
			});
			
			this.background = glacier.color.BLACK;
		}
		
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
