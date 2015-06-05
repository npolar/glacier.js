glacier.Scene = function Scene(container, options) {
	var camera, canvas, context, contextOptions = {}, running = false, id, self = this, previous;
	
	if(typeof container == 'string') {
		if(!((container = document.getElementById(container)) instanceof HTMLElement)) {
			throw new glacier.exception.UndefinedElement(container, '(constructor)', 'Scene');
		}
	} else if(!(container instanceof HTMLElement)) {
		throw new glacier.exception.InvalidParameter('container', container, '(constructor)', 'Scene');
	}
	
	if(container instanceof HTMLCanvasElement) {
		canvas = container;
		container = document.createElement('DIV');
		canvas.parentNode.insertBefore(container, canvas);
		container.appendChild(canvas);
		
		if((id = canvas.getAttribute('id'))) {
			canvas.removeAttribute('id');
			container.setAttribute('id', id);
		}
	} else {
		canvas = document.createElement('CANVAS');
		canvas.style.position = 'absolute';
		canvas.style.height = canvas.style.width = '100%';
		container.appendChild(canvas);
	}
	
	context = new glacier.Context(canvas, contextOptions);
	camera = new glacier.Camera(60.0, context.width / context.height, 1.0, 100.0);
	
	Object.defineProperties(self, {
		camera: { value: camera },
		container: { value: container },
		context: { value: context },
		runCallbacks: { value: [] },
		running: {
			get: function() {
				return !!running;
			},
			set: function(value) {
				if(typeof value == 'boolean') {
					if(value != running) {
						if((running = value)) {
							self.run();
						} else {
							self.end();
						}
					}
				} else {
					glacier.error.invalidAssignment('running', value, 'boolean', 'Scene');
				}
			}
		}
	});
	
	window.addEventListener('resize', function(event) {
		self.camera.aspectRatio = (context.width / context.height);
	});
	
	(function sceneRunner(timestamp) {
		if(self.running) {
			// Calculate dtime and FPS
			var dtime = (((timestamp - previous) / 1000.0) || 0.0);
			self.fps = (dtime ? (((1.0 / dtime) + self.fps) / 2.0) : 0.0);
			previous = timestamp;
			
			self.runCallbacks.forEach(function(callback) {
				if(typeof callback == 'function') {
					callback.call(self, dtime);
				}
			});
		}
		
		requestAnimationFrame(sceneRunner);
	})();
};

glacier.Scene.prototype = {
	end: function() {
		this.fps = 0.0;
		this.running = false;
	},
	
	run: function() {
		this.running = true;
	}
};
