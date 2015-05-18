glacier.GlobeScene = function GlobeScene(container, options) {
	// Call Scene constructor
	glacier.Scene.call(this, container, options);
	
	// Parse options with type-checking
	options = glacier.parseOptions(options, {
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
	this.camera.follow(this.camera.target, new glacier.Vector2(90, 0), 2);
	
	// Bind view and projection matrices
	this.context.view = this.camera.matrix;
	this.context.projection = this.camera.projection;
	
	// Enable mouse controlling as required
	if(options.mouseControl) {
		this.camera.bindMouse(this.context.canvas);
	}
	
	// Add draw callback
	this.runCallbacks.push(function() {
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
		this.base.matrix.rotate(glacier.degToRad(-this.obliquity), 0, 0, 1);
		this.base.matrix.rotate(glacier.degToRad(this.rotation), 0, 1, 0);
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
	addData: function(geoJsonURL, color) {
		var self = this, dataObject, drawables = {};
		
		if(typeof geoJsonURL == 'string') {
			glacier.load(geoJsonURL, function(data) {
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
							self.latLngToPoint(data.lat, data.lng, data.alt),
							(color instanceof glacier.Color ? color : glacier.color.WHITE)
						);
					}
				}
				
				if((data = glacier.geoJSON.parse(data))) {
					dataObject = self.data[geoJsonURL] = {
						data: data,
						drawables: []
					};
					
					addDrawables(dataObject.drawables, data);
					
					dataObject.drawables.forEach(function(drawable) {
						if(drawable instanceof glacier.Drawable) {
							drawable.init(self.context);
						}
					});
				}
			});
		} else {
			throw new glacier.exception.InvalidParameter('geoJsonURL', geoJsonURL, 'string', 'addData', 'GlobeScene');
		}
	},
	
	latLngToPoint: function(lat, lng, alt) {
		if(typeof lat != 'number') {
			throw new glacier.exception.InvalidParameter('lat', lat, 'number', 'latLngTo3D', 'GlobeScene');
		}
		
		if(typeof lng != 'number') {
			throw new glacier.exception.InvalidParameter('lng', lng, 'number', 'latLngTo3D', 'GlobeScene');
		}
		
		if(alt !== undefined && (typeof alt != 'number')) {
			throw new glacier.exception.InvalidParameter('alt', alt, 'number', 'latLngTo3D', 'GlobeScene');
		}
		
		var theta = glacier.degToRad(lat), phi = glacier.degToRad(lng);
		
		// Altitude based on equatorial radius in WGS-84	
		alt = 1.0 + ((alt || 0) * (1.0 / 6378137));
		
		return new glacier.Vector3(
			alt * -this.base.radius * Math.cos(theta) * Math.cos(phi),
			alt * this.base.radius * Math.sin(theta),
			alt * this.base.radius * Math.cos(theta) * Math.sin(phi)
		);
	},
	
	pointToLatLng: function(point) {
		if(!(point instanceof glacier.Vector3)) {
			throw new glacier.exception.InvalidParameter('point', point, 'Vector3', 'worldToLatLng', 'GlobeScene');
		}
		
		return {
			lat: 90.0 - glacier.radToDeg(Math.acos(point.y / this.base.radius)),
			lng: ((270.0 + glacier.radToDeg(Math.atan2(point.x, point.z))) % 360) - 180.0
		};
	},
	
	rayCast: function(x, y) {
		if(typeof x != 'number') {
			throw new glacier.exception.InvalidParameter('x', x, 'number', 'rayCast', 'GlobeScene');
		}
		
		if(typeof y != 'number') {
			throw new glacier.exception.InvalidParameter('y', y, 'number', 'rayCast', 'GlobeScene');
		}
		
		var ndc = new glacier.Vector3(
			2.0 * (x / this.context.width) - 1.0,
			1.0 - 2.0 * (y / this.context.height),
			-1.0
		), eye, pos, ray, intersection;
		
		eye = this.camera.position.copy;
		pos = new glacier.Vector4(ndc).multiply(this.camera.projection.inverse).multiply(this.camera.matrix.inverse);
		ray = new glacier.Ray(eye, pos.divide(pos.w).xyz);
		
		if((intersection = ray.intersects(this.base))) {
			intersection.multiply(this.base.matrix.inverse);
		}
		
		return intersection;
	}
});

/* Index Limits
6 * 10922 = 65532
104^2 * 6 = 64896
(90*0.8)*(180*0.8)*6=62208
*/
