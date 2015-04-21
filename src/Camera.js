glacier.Camera = function Camera(fieldOfView, aspectRatio, clipNear, clipFar) {
	var args = [ 'fieldOfView', 'aspectRatio', 'clipNear', 'clipFar' ], error;
	
	// Set clipNear/clipFar defaults if not set
	clipNear = (clipNear || 0.1);
	clipFar	= (clipFar || 100.0);
	
	// Check parameters and declare members fieldOfView, aspectRatio, clipNear and clipFar
	[ fieldOfView, aspectRatio, clipNear, clipFar ].forEach(function(arg, index) {
		if(typeof arg != 'number' || arg <= 0.0) {
			glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'positive number', method: 'Camera constructor' });
			error = true;
		} else {
			Object.defineProperty(this, args[index], {
				get: function() {
					return arg;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0.0) {
						arg = value;
						this.update();
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: 'Camera.' + args[index], value: value, expected: 'positive number' });
					}
				}
			});
		}
	}, this);
	
	// Declare typed members matrix, position and target
	glacier.union.call(this, 'matrix', new glacier.Matrix44(), glacier.Matrix44);
	glacier.union.call(this, 'position', new glacier.Vector3(0, 1, 1), glacier.Vector3);
	glacier.union.call(this, 'target', new glacier.Vector3(0, 0, 0), glacier.Vector3);
	
	if(error) {
		verticalViewAngle = (typeof verticalViewAngle == 'number' && verticalViewAngle > 0.0 ? verticalViewAngle : 60.0);
		aspectRatio = (typeof aspectRatio == 'number' && aspectRatio > 0.0 ? aspectRatio : 16 / 9);
	} else this.update();
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
		
		this.target.assign(target);
		
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
		
		this.matrix.assign(new glacier.Matrix44());
		this.matrix.perspective(this.fieldOfView, this.aspectRatio, this.clipNear, this.clipFar);
		//this.matrix.ortho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
		
		this.matrix.assign(new glacier.Matrix44([
			x.x, y.x, z.x, 0.0,
			x.y, y.y, z.y, 0.0,
			x.z, y.z, z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]).multiply(this.matrix)).translate(-this.position.x, -this.position.y, -this.position.z);
	}
};
