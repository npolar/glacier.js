glacier.Camera = function Camera(fieldOfView, aspectRatio, clipNear, clipFar) {
	var args = [ 'fieldOfView', 'aspectRatio', 'clipNear', 'clipFar' ];
	
	// Set clipNear/clipFar defaults if not set
	clipNear = (clipNear || 0.1);
	clipFar	= (clipFar || 100.0);
	
	// Check parameters and declare members fieldOfView, aspectRatio, clipNear and clipFar
	[ fieldOfView, aspectRatio, clipNear, clipFar ].forEach(function(arg, index) {
		if(typeof arg != 'number' || arg <= 0.0) {
			throw new glacier.exception.InvalidParameter(args[index], arg, 'positive number', '(constructor)', 'Camera');
		} else {
			Object.defineProperty(this, args[index], {
				get: function() {
					return arg;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0.0) {
						arg = value;
						
						this.projection.assignIdentity();
						this.projection.perspective(this.fieldOfView, this.aspectRatio, this.clipNear, this.clipFar);
					} else {
						throw new glacier.exception.InvalidAssignment(args[index], value, 'positive number', 'Camera');
					}
				}
			});
		}
	}, this);
	
	// Declare typed members matrix, position, projection and target
	glacier.addTypedProperty(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'position', new glacier.Vector3(0, 1, 1), glacier.Vector3);
	glacier.addTypedProperty(this, 'projection', new glacier.Matrix44(), glacier.Matrix44);
	glacier.addTypedProperty(this, 'target', new glacier.Vector3(0, 0, 0), glacier.Vector3);
	
	this.update();
};

glacier.Camera.prototype = {
	bindMouse: function(container, options) {
		if(typeof container == 'string') {
			container = document.getElementById(container);
		}
		
		if(container instanceof HTMLElement) {
			var self = this, update;
			
			// Parse options with type-checking
			options = glacier.parseOptions(options, {
				movementButton:	[ { number: null }, null ],
				rotationButton:	[ { number:    0 }, null ],
				zoomButton:		[ { number: null }, null ],
				zoomMin:		{ number: 1.01, gt: 0.0 },
				zoomMax:		{ number: 10.0, gt: 0.0 },
				zoomSteps:		{ number: 30, gt: 0 },
				wheelMovement:	{ boolean: false },
				wheelRotation:	{ boolean: false },
				wheelZoom:		{ boolean: true  },
			});
			
			self.mouseHandler = {
				container: container,
				target: new glacier.Vector3(0, 0, 0),
				angle: new glacier.Vector2(0, 0),
				zoom: options.zoomMax,
				zoomStep: options.zoomSteps,
				
				callbacks: {
					mousedown: function(event) {
						if(options.rotationButton !== null && event.button === options.rotationButton) {
							self.mouseHandler.rotationStart = {
								position: new glacier.Vector2(event.clientX, event.clientY),
								angle: new glacier.Vector2(self.mouseHandler.angle)
							};
						}
					},
					mouseup: function(event) {
						if(options.rotationButton !== null && event.button === options.rotationButton) {
							self.mouseHandler.rotationStart = null;
						}
					},
					mousemove: function(event) {
						if(self.mouseHandler.rotationStart) {
							// TODO: Improved mouse movement (without hard-coded values)
							
							var offset = new glacier.Vector2(
								(event.clientX - self.mouseHandler.rotationStart.position.x) / self.mouseHandler.container.offsetWidth * 360,
								-(event.clientY - self.mouseHandler.rotationStart.position.y) / self.mouseHandler.container.offsetHeight * 180
							);
							
							self.mouseHandler.angle = new glacier.Vector2(self.mouseHandler.rotationStart.angle).subtract(offset);
							self.mouseHandler.angle.y = glacier.clamp(self.mouseHandler.angle.y, -89, 89);
							update();
						}
					},
					wheel: function(event) {
						function easeIn(pos, min, max, len) {
							return (max - min) * Math.pow(2, 10 * (pos / len - 1)) + min;
						}
						
						if(options.wheelZoom) {
							self.mouseHandler.zoomStep = glacier.clamp(self.mouseHandler.zoomStep + (event.deltaY > 0 ? 1 : (event.deltaY < 0 ? -1 : 0)), -options.zoomSteps, options.zoomSteps);
							self.mouseHandler.zoom = easeIn(self.mouseHandler.zoomStep, options.zoomMin, options.zoomMax, options.zoomSteps);
							update();
						}
					}
				}
			};
			
			(update = function() {
				self.follow(self.mouseHandler.target, self.mouseHandler.angle, self.mouseHandler.zoom);
			}).call();
			
			for(var c in self.mouseHandler.callbacks) {
				if(self.mouseHandler.callbacks.hasOwnProperty(c) && typeof self.mouseHandler.callbacks[c] == 'function') {
					self.mouseHandler.container.addEventListener(c, self.mouseHandler.callbacks[c]);
				}
			}
		} else {
			throw new glacier.exception.InvalidParameter('container', container, 'HTMLElement', 'bindMouse', 'Scene');
		}
	},
	unbindMouse: function() {
		if(this.mouseHandler.container instanceof HTMLElement) {
			for(var c in this.mouseHandler.callbacks) {
				if(this.mouseHandler.callbacks.hasOwnProperty(c) && typeof this.mouseHandler.callbacks[c] == 'function') {
					this.mouseHandler.container.removeEventListener(c, this.mouseHandler.callbacks[c]);
					this.mouseHandler.callbacks[c] = null;
				}
			}
		}
		
		this.mouseHandler.container = null;
	},
	follow: function(target, angle, distance) {
		if(!(target instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('target', target, 'Vector3', 'follow', 'Camera');
		}
		
		if(!(angle instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('angle', target, 'Vector2', 'follow', 'Camera');
		}
		
		if(typeof distance != 'number' || distance <= 0.0) {
			throw new glacier.exception.InvalidParameter('distance', distance, 'positive number', 'follow', 'Camera');
		}
		
		var ver = {}, hor = {}, dir = new glacier.Vector2(glacier.limitAngle(angle.x), glacier.limitAngle(angle.y));
		
		ver.hyp = distance;
		ver.opp = ver.hyp * Math.sin(glacier.degToRad(dir.y));
		ver.adj = ver.hyp * Math.cos(glacier.degToRad(dir.y));
		
		hor.hyp = ver.adj;
		hor.opp = hor.hyp * Math.sin(glacier.degToRad(dir.x));
		hor.adj = hor.hyp * Math.cos(glacier.degToRad(dir.x));
		
		this.target.assign(target);
		
		this.position.x = target.x - hor.opp;
		this.position.y = target.y + ver.opp;
		this.position.z = target.z - hor.adj;
		
		this.update();
	},
	update: function() {
		var z, x, y = new glacier.Vector3(0, 1, 0);
		
		if((z = new glacier.Vector3(this.position).subtract(this.target)).length) {
			z.normalize();
		}
		
		if((x = y.cross(z)).length) {
			x.normalize();
		}
		
		if((y = z.cross(x)).length) {
			y.normalize();
		}
		
		this.matrix.assign([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).translate(-this.position.x, -this.position.y, -this.position.z);
	}
};
