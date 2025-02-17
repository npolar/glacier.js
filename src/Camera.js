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
						glacier.error.invalidAssignment(args[index], value, 'positive number', 'Camera');
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
