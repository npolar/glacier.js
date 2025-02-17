glacier.GlobeScene = function GlobeScene(container, options) {
	// Call Scene constructor
	glacier.Scene.call(this, container, options);
	
	// Parse options with type-checking
	options = glacier.parseOptions(options, {
		background:		{ Color: glacier.color.BLACK, class: glacier.Color },
		latitudes:		{ number: 45, gt: 2 },
		longitudes:		{ number: 90, gt: 2 },
		radius:			{ number: 1.0, gt: 0.0 },
		color:			{ Color: glacier.color.BLUE, class: glacier.Color },
		rotationSpeed:	{ number: 0.0 },
		obliquity:		{ number: 0.0 },
		texture:		[ null, 'string' ],
		nightTexture:	[ null, 'string' ],
		normalMap:		[ null, 'string' ],
		mouseControl:	{ boolean: true }
	}, 'GlobeScene');
	
	var rotation = 0.0;
	
	/* TODO:
	 *  - Save rotation as Quaternion
	 *  - Save globe position as Vector3
	 *  - Rotate globe (not camera) with mouse
	 *  - Zoom still modifies camera distance
	 */
	
	Object.defineProperties(this, {
		base: { get: function() { return this.layers[0]; } },
		data: { value: {} },
		layers: { value: new glacier.TypedArray('Sphere', glacier.Sphere) },
		
		obliquity: {
			get: function() {
				return options.obliquity;
			},
			set: function(value) {
				if(typeof value == 'number') {
					options.obliquity = value;
				}
			}
		},
		rotation: {
			get: function() {
				return rotation;
			},
			set: function(value) {
				if(typeof value == 'number') {
					rotation = value;
				}
			}
		}
	});
	
	this.layers.push(new glacier.Sphere(options.latitudes, options.longitudes, options.radius));
	
	// Initialize base mesh and textures
	this.base.texture0 = options.texture;
	this.base.texture1 = options.nightTexture;
	this.base.texture2 = options.normalMap;
	this.base.init(this.context, { shader: 'globe' });
	
	// Set camera clip planes
	this.camera.clipNear = 0.01;
	this.camera.clipFar = 100.0;
	
	// Add angle and zoom properties to camera, and initialize following
	this.camera.angle = new glacier.Vector2(90, 0);
	this.camera.zoom = 2.0;
	this.camera.follow(this.camera.target, this.camera.angle, this.camera.zoom);
	
	// Bind view and projection matrices
	this.context.view = this.camera.matrix;
	this.context.projection = this.camera.projection;
	
	// Enable mouse controlling as required
	if(options.mouseControl) {
		this.bindMouse();
	}
	
	// Set context background color
	this.context.background = options.background;
	
	// Add draw callback
	this.addRunCallback(function() {
		var gl = this.context.gl, d;
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		this.context.clear();
		
		this.base.matrix.assignIdentity();
		//this.base.matrix.rotate(glacier.degToRad(-this.obliquity), 0, 0, 1);
		//this.base.matrix.rotate(glacier.degToRad(this.rotation), 0, 1, 0);
		this.base.draw();
		
		function drawData(data) {
			if(data instanceof glacier.Drawable) {
				data.matrix.assign(this.base.matrix);
				data.draw();
			} else if(typeof data == 'object') {
				if(data.drawables instanceof Array) {
					data.drawables.forEach(function(drawable) {
						drawData.call(this, drawable);
					}, this);
				}
			}
		}
		
		for(d in this.data) {
			drawData.call(this, this.data[d]);
		}
	});
};

// glacier.GlobeScene extends glacier.Scene
glacier.extend(glacier.GlobeScene, glacier.Scene, {
	addData: function(geoJson, color, callback) {
		var self = this, dataObject, drawables = {}, uid;
		
		function addDrawables(array, data) {
			if(data instanceof glacier.geoJSON.Feature) {
				addDrawables(array, data.geometry);
			} else if(data instanceof glacier.geoJSON.FeatureCollection) {
				data.features.forEach(function(feature) {
					addDrawables(array, feature);
				});
			} else if(data instanceof glacier.geoJSON.MultiPoint) {
				data.points.forEach(function(point) {
					addDrawables(array, point);
				});
			} else if(data instanceof glacier.geoJSON.Point) {
				if(!drawables.hasOwnProperty('points')) {
					drawables.points = array.push(new glacier.PointCollection()) - 1;
				}
				
				array[drawables.points].addPoint(
					self.latLngToPoint(new glacier.Vector2(data.lng, data.lat), data.alt),
					(color instanceof glacier.Color ? color : glacier.color.WHITE)
				);
			}
		}
		
		if(typeof geoJson == 'string') {
			glacier.load(geoJson, function(data) {
				self.addData(JSON.parse(data), color, callback);
			});
		} else if(typeof geoJson == 'object') {
			if((data = glacier.geoJSON.parse(geoJson))) {
				dataObject = self.data[(uid = glacier.generateUID())] = {
					geoJSON: data,
					drawables: [],
					hide: function() {
						this.drawables.forEach(function(drawable) {
							if(drawable instanceof glacier.Drawable) {
								drawable.visible = false;
							}
						});
					},
					show: function() {
						this.drawables.forEach(function(drawable) {
							if(drawable instanceof glacier.Drawable) {
								drawable.visible = true;
							}
						});
					}
				};
				
				addDrawables(dataObject.drawables, data);
				
				dataObject.drawables.forEach(function(drawable) {
					if(drawable instanceof glacier.Drawable) {
						drawable.init(self.context);
					}
				});
				
				if(typeof callback == 'function') {
					callback(uid, dataObject);
				}
			}
		} else {
			throw new glacier.exception.InvalidParameter('geoJson', geoJson, 'geoJSON object or URL as string', 'addData', 'GlobeScene');
		}
	},
	
	bindMouse: function(options) {
		var self = this, camUpdate, c, latLng;
		
		self.unbindMouse();
		
		function easeIn(pos, min, max, len) {
			return (max - min) * Math.pow(2, 10 * (pos / len - 1)) + min;
		}
		
		function easeOut(pos, initial, target, len) {
			return (target - initial) * (-Math.pow(2, -10 * pos / len) + 1) + initial;
		}
		
		// Parse options with type-checking
		options = glacier.parseOptions(options, { 
			zoomMin:		{ number: 1.01, gt: 0.0 },
			zoomMax:		{ number: 10.0, gt: 0.0 },
			zoomSteps:		{ number: 30, gt: 0 },
		});
		
		self.camera.zoom = options.zoomMax;
		
		self.mouseHandler = {
			target: new glacier.Vector3(0, 0, 0),
			angleVelocity: null,
			zoomStep: options.zoomSteps,
			
			callbacks: {
				mousedown: function(event) {
					if(event.button === 0) {	// Left mouse for rotation
						self.mouseHandler.clickLatLng = self.screenToLatLng(event.clientX, event.clientY);
						self.mouseHandler.angleVelocity = null;
					}
				},
				mouseup: function(event) {
					if(event.button === 0) {	// Left mouse for rotation
						self.mouseHandler.clickLatLng = null;
						
						if(self.mouseHandler.deltaLatLng) {
							self.mouseHandler.angleVelocity = {
								initial: self.mouseHandler.deltaLatLng.copy,
								current: new glacier.Vector2(0, 0),
								dtime: 0.0
							};
						}
					}
				},
				mousemove: function(event) {
					if((latLng = self.screenToLatLng(event.clientX, event.clientY))) {
						self.context.canvas.style.cursor = 'move';
						
						if(self.mouseHandler.clickLatLng) {
							self.mouseHandler.deltaLatLng = latLng.subtract(self.mouseHandler.clickLatLng);
							self.camera.angle.subtract(self.mouseHandler.deltaLatLng);
							camUpdate();
						}
					} else {
						self.context.canvas.style.cursor = 'default';
						self.mouseHandler.deltaLatLng = null;
					}
				},
				touchend: function(event) {
					self.mouseHandler.clickLatLng = null;
					
					if(self.mouseHandler.deltaLatLng) {
						self.mouseHandler.angleVelocity = {
							initial: self.mouseHandler.deltaLatLng.copy,
							current: new glacier.Vector2(0, 0),
							dtime: 0.0
						};
					}
					
					event.preventDefault();
				},
				touchmove: function(event) {
					if(event.touches.length == 1) {
						var touch = event.touches[0];
						
						if((latLng = self.screenToLatLng(event.clientX, event.clientY))) {
							if(self.mouseHandler.clickLatLng) {
								self.mouseHandler.deltaLatLng = latLng.subtract(self.mouseHandler.clickLatLng);
								self.camera.angle.subtract(self.mouseHandler.deltaLatLng);
								camUpdate();
							}
						} else {
							self.mouseHandler.deltaLatLng = null;
						}
					}
					
					event.preventDefault();
				},
				touchstart: function(event) {
					if(event.touches.length == 1) {
						var touch = event.touches[0];
						
						self.mouseHandler.clickLatLng = self.screenToLatLng(event.clientX, event.clientY);
						self.mouseHandler.angleVelocity = null;
					}
					
					event.preventDefault();
				},
				wheel: function(event) {
					if(event.deltaY) {
						self.mouseHandler.zoomStep = glacier.clamp(self.mouseHandler.zoomStep + (event.deltaY > 0 ? 1 : -1), -options.zoomSteps, options.zoomSteps);
						self.camera.zoom = easeIn(self.mouseHandler.zoomStep, options.zoomMin, options.zoomMax, options.zoomSteps);
						camUpdate();
					}
				}
			},
			
			camEaseCallback: function(dtime) {
				if(self.mouseHandler.angleVelocity) {
					var velocity = self.mouseHandler.angleVelocity, length = velocity.initial.length;
					
					velocity.current.x = easeOut((velocity.dtime += dtime), velocity.initial.x, 0.0, length);
					velocity.current.y = easeOut((velocity.dtime += dtime), velocity.initial.y, 0.0, length);
					self.camera.angle.subtract(velocity.current);
					
					camUpdate();
					
					if(glacier.compare(velocity.current.length, 0.0)) {
						self.mouseHandler.angleVelocity = null;
					}
				}
			}
		};
			
		(camUpdate = function() {
			self.camera.angle.x = glacier.limitAngle(self.camera.angle.x, -180, 180);
			self.camera.angle.y = glacier.clamp(self.camera.angle.y, -89.99, 89.99);
			self.camera.follow(self.mouseHandler.target, self.camera.angle, self.camera.zoom);
		}).call();
			
		for(c in self.mouseHandler.callbacks) {
			if(self.mouseHandler.callbacks.hasOwnProperty(c) && typeof self.mouseHandler.callbacks[c] == 'function') {
				self.context.canvas.addEventListener(c, self.mouseHandler.callbacks[c]);
			}
		}
		
		self.addRunCallback(self.mouseHandler.camEaseCallback);
	},
	
	focus: function(latLng, callback) {
		if(!(latLng instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('latLng', latLng, 'Vector2', 'focus', 'GlobeScene');
		}
		
		function easeInOut(t, b, c, d) {
			var f = ((t /= (d / 2)) < 1 ? Math.pow(2, 10 * --t) : -Math.pow(2, -10 * --t) + 2) || 0;
			return new glacier.Vector2((c.x / 2) * f + b.x, (c.y / 2) * f + b.y);
		}
		
		var self = this, focusUpdate, step = 0, steps, start = self.camera.angle.copy, vec2 = latLng.copy;
		vec2.lng += 90.0;
		
		if(self.mouseHandler) {
			self.camera.angle.assign(vec2);
			self.mouseHandler.target.assign(self.camera.target);
		}
		
		steps = start.distance(vec2);
		vec2.subtract(start);
		
		(focusUpdate = function() {
			self.camera.follow(self.camera.target, self.camera.angle.assign(easeInOut(step, start, vec2, steps)), self.camera.zoom);
			
			if(++step < steps) {
				requestAnimationFrame(focusUpdate);
			} else if(typeof callback == 'function') {
				callback(latLng);
			}
		}).call();
	},
	
	latLngToPoint: function(latLng, alt) {
		if(!(latLng instanceof glacier.Vector2)) {
			throw new glacier.exception.InvalidParameter('latLng', latLng, 'Vector2', 'latLngToPoint', 'GlobeScene');
		}
		
		if(alt !== undefined && (typeof alt != 'number')) {
			throw new glacier.exception.InvalidParameter('alt', alt, 'number', 'latLngToPoint', 'GlobeScene');
		}
		
		var theta = glacier.degToRad(latLng.lat), phi = glacier.degToRad(latLng.lng);
		
		// Altitude based on equatorial radius in WGS-84	
		alt = 1.0 + ((alt || 0) * (1.0 / 6378137));
		
		return new glacier.Vector3(
			alt * this.base.radius * -Math.cos(theta) * Math.cos(phi),
			alt * this.base.radius *  Math.sin(theta),
			alt * this.base.radius *  Math.cos(theta) * Math.sin(phi)
		);
	},
	
	latLngToScreen: function(latLng, alt) {
		return this.context.worldToScreen(this.latLngToPoint(latLng, alt).multiply(this.base.matrix));
	},
	
	pointToLatLng: function(point) {
		if(!(point instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('point', point, 'Vector3', 'worldToLatLng', 'GlobeScene');
		}
		
		return new glacier.Vector2(
			((270.0 + glacier.radToDeg(Math.atan2(point.x, point.z))) % 360) - 180.0,
			90.0 - glacier.radToDeg(Math.acos(point.y / this.base.radius))
		);
	},
	
	rayCast: function(xOrVec2, y) {
		if(xOrVec2 instanceof glacier.Vector2) {
			return this.rayCast(xOrVec2.x, xOrVec2.y);
		} else {
			var args = [ 'x', 'y' ];
			
			[ xOrVec2, y ].forEach(function(arg, index) {
				if(isNaN(arg)) {
					throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'rayCast', 'GlobeScene');
				}
			});
		}
			
		var ndc = new glacier.Vector3(
			2.0 * (xOrVec2 / this.context.width) - 1.0,
			1.0 - 2.0 * (y / this.context.height),
			1.0
		), eye, pos, intersection;
		
		eye = this.camera.position.copy;
		pos = new glacier.Vector4(ndc).multiply(this.camera.projection.inverse).multiply(this.camera.matrix.inverse);
		
		return new glacier.Ray(eye, pos.divide(pos.w).xyz);
	},
	
	screenToLatLng: function(xOrVec2, y) {
		var intersection, ray = this.rayCast(xOrVec2, y);
		
		if((intersection = ray.intersects(this.base))) {
			intersection.multiply(this.base.matrix.inverse);
			return this.pointToLatLng(intersection);
		}
		
		return null;
	},
	
	unbindMouse: function() {
		var self = this, c;
		
		if(self.mouseHandler) {
			for(c in self.mouseHandler.callbacks) {
				if(self.mouseHandler.callbacks.hasOwnProperty(c) && typeof self.mouseHandler.callbacks[c] == 'function') {
					self.context.canvas.removeEventListener(c, self.mouseHandler.callbacks[c]);
					self.mouseHandler.callbacks[c] = null;
				}
			}
			
			self.removeRunCallback(self.mouseHandler.camEaseCallback);
		}
		
		self.mouseHandler = null;
		self.context.canvas.style.cursor = 'default';
	},
});

/* Index Limits
6 * 10922 = 65532
104^2 * 6 = 64896
(90*0.8)*(180*0.8)*6=62208
*/
