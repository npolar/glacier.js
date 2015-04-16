glacier.Camera = function Camera(verticalViewAngle, aspectRatio) {
	var args = [ 'verticalViewAngle', 'aspectRatio' ], error;
	
	Object.defineProperties(this, {
		aspectRatio: {
			get: function() {
				return aspectRatio;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0.0) {
					aspectRatio = value;
					update();
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Camera.aspectRatio', value: value, expected: 'positive number' });
				}
			}
		},
		
		fieldOfView: {
			get: function() {
				return verticalViewAngle;
			},
			set: function(value) {
				if(typeof value == 'number' && value > 0.0) {
					verticalViewAngle = value;
					update();
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'camera.fieldOfView', value: value, expected: 'positive number' });
				}
			}
		},
		
		matrix: {
			value: new glacier.Matrix44(),
			writable: false
		},
		
		position: {
			value: new glacier.Vector3(0, 1, 1),
			writable: false
		},
		
		target: {
			value: new glacier.Vector3(0, 0, 0),
			writable: false
		}
	});
	
	[ verticalViewAngle, aspectRatio ].forEach(function(arg, index) {
		if(typeof arg != 'number' || arg <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'positive number', method: 'Camera constructor' });
			error = true;
		}
	});
	
	if(error) {
		verticalViewAngle = (typeof verticalViewAngle == 'number' && verticalViewAngle > 0.0 ? verticalViewAngle : 60.0);
		aspectRatio = (typeof aspectRatio == 'number' && aspectRatio > 0.0 ? aspectRatio : 16 / 9);
	}
	
	this.update();
};

glacier.Camera.prototype = {
	follow: function(target, angle, distance) {
		if(!(target instanceof glacier.Vector3)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'target', value: typeof target, expected: 'Vector3', method: 'Camera.follow' });
			return;
		}
		
		if(!(angle instanceof glacier.Vector2)) {
			glacier.error('INVALID_PARAMETER', { parameter: 'angle', value: typeof angle, expected: 'Vector2', method: 'Camera.follow' });
			return;
		}
		
		if(typeof distance != 'number' || distance <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: 'distance', value: typeof distance, expected: 'positive number', method: 'Camera.follow' });
			return;
		}
		
		var ver = {}, hor = {}, dir = new glacier.Vector2(glacier.limitAngle(angle.x), glacier.limitAngle(angle.y));
		
		ver.hyp = distance;
		ver.opp = ver.hyp * Math.sin(glacier.degToRad(dir.y));
		ver.adj = ver.hyp * Math.cos(glacier.degToRad(dir.y));
		
		hor.hyp = ver.adj;
		hor.opp = hor.hyp * Math.sin(glacier.degToRad(dir.x));
		hor.adj = hor.hyp * Math.cos(glacier.degToRad(dir.x));
		
		this.target	= target;
		
		this.position.x = target.x - hor.opp;
		this.position.y = target.y + ver.opp;
		this.position.z = target.z - hor.adj;
		
		this.update();
	},
	update: function() {
		var z, x, y = new glacier.Vector3(0, 1, 0);
		
		if((z = new glacier.Vector3(this.position).subtract(this.target)).length()) {
			z.normalize();
		}
		
		if((x = y.crossProduct(z)).length()) {
			x.normalize();
		}
		
		if((y = z.crossProduct(x)).length()) {
			y.normalize();
		}
		
		// TODO: Remove hard-coded clipping planes
		this.matrix.assign(new glacier.Matrix44());
		this.matrix.perspective(this.fieldOfView, this.aspectRatio, 0.1, 100.0);
		//this.matrix.ortho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
		
		this.matrix.assign(new glacier.Matrix44([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).multiply(this.matrix)).translate(-this.position.x, -this.position.y, -this.position.z);
	}
};
