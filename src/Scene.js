glacier.Scene = function Scene(canvas, options) {
	var running = false,
		contextOptions = {},
		context = new glacier.Context(canvas, contextOptions), 
		camera = new glacier.Camera(60.0, context.width / context.height, 1.0, 100.0);
	
	Object.defineProperties(this, {
		camera: { value: camera },
		context: { value: context },
		runCallbacks: { value: [] },
		running: {
			get: function() {
				return running;
			},
			set: function(value) {
				if(typeof value == 'boolean') {
					if((running = value)) {
						this.run();
					} else {
						this.end();
					}
				} else {
					throw new glacier.exception.InvalidAssignment('running', value, 'boolean', 'Scene');
				}
			}
		}
	});
	
	window.addEventListener('resize', function(event) {
		this.camera.aspectRatio = (context.width / context.height);
	}.bind(this));
};

glacier.Scene.prototype = {
	fps: 0.0,
	
	end: function() {
		if(this.running) {
			this.fps = 0.0;
			this.running = false;
		}
	},
	
	run: function() {
		var self = this, previous;
		
		if(!self.running) {
			self.running = true;
			
			(function sceneRunner(timestamp) {
				if(self.running) {
					// Calculate dtime and FPS
					var dtime = (timestamp - previous) / 1000.0;
					self.fps = (((1.0 / dtime) + self.fps) / 2.0 || 0);
					previous = timestamp;
					
					self.runCallbacks.forEach(function(callback) {
						if(typeof callback == 'function') {
							callback.call(self, dtime);
						}
					});
					
					requestAnimationFrame(sceneRunner);
				}
			})();
		}
	}
};
