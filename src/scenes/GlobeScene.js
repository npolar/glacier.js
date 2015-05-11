glacier.GlobeScene = function GlobeScene(canvas, options) {
	// Call Scene constructor
	glacier.Scene.call(this, canvas, options);
	
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
	
	// Initialize camera
	this.camera.clipNear = 0.01;
	this.camera.clipFar = 100.0;
	this.context.projection = this.camera.projection;
	
	// Enable mouse controlling as required
	if(options.mouseControl) {
		this.camera.bindMouse(canvas);
	}
	
	// Add draw callback
	this.runCallbacks.push(function() {
		var gl = this.context.gl, d;
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		this.context.clear();
		
		this.base.matrix.assignIdentity();
		this.base.matrix.rotate(glacier.degToRad(-this.obliquity), 0, 0, 1);
		this.base.matrix.rotate(glacier.degToRad(this.rotation), 0, 1, 0);
		this.base.matrix.multiply(this.camera.matrix); // View * Model
		this.base.draw();
		
		for(d in this.data) {
			if(this.data[d] instanceof glacier.Drawable) {
				this.data[d].matrix.assign(this.base.matrix);
				this.data[d].draw();
			}
		}
	});
};

// glacier.GlobeScene extends glacier.Scene
glacier.extend(glacier.GlobeScene, glacier.Scene, {
	addData: function(geoJsonURL, color) {
		var self = this, modified = [];
		
		if(typeof geoJsonURL == 'string') {
			glacier.load(geoJsonURL, function(data) {
				function addGeometry(object) {
					if(object instanceof glacier.geoJSON.Point) {
						if(!(self.data.points instanceof glacier.PointCollection)) {
							self.data.points = new glacier.PointCollection();
						}
						
						self.data.points.addPoint(
							self.latLngToWorld(object.lat, object.lng, object.alt),
							(color instanceof glacier.Color ? color : glacier.color.WHITE)
						);
						
						if(modified.indexOf('points') == -1) {
							modified.push('points');
						}
					} else if(object instanceof glacier.geoJSON.MultiPoint) {
						object.points.forEach(function(point) {
							addGeometry(point);
						});
					} else if(object instanceof glacier.geoJSON.Feature) {
						addGeometry(object.geometry);
					} else if(object instanceof Array) {
						object.forEach(function(element) {
							addGeometry(element);
						});
					}
				}
				
				if((data = glacier.geoJSON.parse(data))) {
					addGeometry(data);
					
					modified.forEach(function(collection) {
						if(self.data[collection] instanceof glacier.Drawable) {
							self.data[collection].init(self.context);
						}
					});
				}
			});
		} else {
			throw new glacier.exception.InvalidParameter('geoJsonURL', geoJsonURL, 'string', 'addData', 'GlobeScene');
		}
	},
	latLngToWorld: function(lat, lng, alt) {
		var theta = glacier.degToRad(lng),
			phi = glacier.degToRad(lat);
		
		// TODO: Implement alt (altitude)
		return new glacier.Vector3(
			-this.base.radius * Math.cos(phi) * Math.cos(theta),
			 this.base.radius * Math.sin(phi),
			 this.base.radius * Math.cos(phi) * Math.sin(theta)
		);
	}
});

/* Index Limits
6 * 10922 = 65532
104^2 * 6 = 64896
(90*0.8)*(180*0.8)*6=62208
*/
