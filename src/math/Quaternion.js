glacier.Quaternion = function Quaternion(x, y, z, w) {
	glacier.addTypedProperty(this, 'x', 0.0);
	glacier.addTypedProperty(this, 'y', 0.0);
	glacier.addTypedProperty(this, 'z', 0.0);
	glacier.addTypedProperty(this, 'w', 1.0);
	
	this.assign(x, y, z, w);
};

glacier.Quaternion.prototype = {
	add: function(value) {
		if(value instanceof glacier.Quaternion) {
			this.x += value.x;
			this.y += value.y;
			this.z += value.z;
			this.w += value.w;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'Quaternion', 'add', 'Quaternion');
		}
		
		return this;
	},
	
	get array() {
		return new Float32Array([ this.x, this.y, this.z, this.w ]);
	},
	
	assign: function(xAngleOrQuat, yOrAxisVec3, z, w) {
		if(xAngleOrQuat !== null && xAngleOrQuat !== undefined) {
			if (xAngleOrQuat instanceof glacier.Quaternion || xAngleOrQuat instanceof glacier.Vector4) {
				this.assign(xAngleOrQuat.x, xAngleOrQuat.y, xAngleOrQuat.z, xAngleOrQuat.w);
			} else if(typeof xAngleOrQuat == 'number' && yOrAxisVec3 instanceof glacier.Vector3) {
				var half = 0.5 * xAngleOrQuat, sinHalf = Math.sin(half);
				this.assign(sinHalf * yOrAxisVec3.x, sinHalf * yOrAxisVec3.y, sinHalf * yOrAxisVec3.z, Math.cos(half));
			} else {
				var args = [ 'x', 'y', 'z', 'w' ];
				
				[ x, y, z, w ].forEach(function(arg, index) {
					if(isNaN(arg)) {
						throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'assign', 'Quaternion');
					}
				});
				
				this.x = x;
				this.y = y;
				this.z = z;
				this.w = w;
			}
		}
		
		return this;
	},
	
	assignIdentity: function() {
		this.assign(0.0, 0.0, 0.0, 1.0);
	},
	
	compare: function(quat, epsilon) {
		if(quat instanceof glacier.Quaternion) {
			return (glacier.compare(this.x, quat.x, epsilon) &&
					glacier.compare(this.y, quat.y, epsilon) &&
					glacier.compare(this.z, quat.z, epsilon) &&
					glacier.compare(this.w, quat.w, epsilon));
		}
		
		throw new glacier.exception.InvalidParameter('quat', quat, 'Quaternion', 'compare', 'Quaternion');
	},
	
	get copy() {
		return new glacier.Quaternion(this);
	},
	
	get matrix() {
		var mat = new glacier.Matrix33(),
			tx = 2.0 * this.x,
			ty = 2.0 * this.y,
			tz = 2.0 * this.z,
			tx_w = tx * this.w,
			ty_w = ty * this.w,
			tz_w = tz * this.w,
			tx_x = tx * this.x,
			ty_x = ty * this.x,
			tz_x = tz * this.x,
			ty_y = ty * this.y,
			tz_y = tz * this.y,
			tz_z = tz * this.z;
			
		mat.array[0] = 1.0 - (ty_y + tz_z);
		mat.array[1] = ty_x - tz_w;
		mat.array[2] = tz_x + ty_w;
		mat.array[3] = ty_x + tz_w;
		mat.array[4] = 1.0 - (tx_x + tz_z);
		mat.array[5] = tz_y - tx_w;
		mat.array[6] = tz_x - ty_w;
		mat.array[7] = tz_y + tx_w;
		mat.array[8] = 1.0 - (tx_x + ty_y);
		
		return mat;
	},
	
	multiply: function(value) {
		if(value instanceof glacier.Quaternion) {
			this.x = (this.w * value.x) + (this.x * value.w) + (this.y * value.z) - (this.z * value.y);
			this.y = (this.w * value.y) + (this.y * value.w) + (this.z * value.x) - (this.x * value.z);
			this.z = (this.w * value.z) + (this.z * value.w) + (this.x * value.y) - (this.y * value.x);
			this.w = (this.w * value.w) - (this.x * value.x) - (this.y * value.y) - (this.z * value.z);
		} else if(typeof value == 'number') {
			this.x *= value;
			this.y *= value;
			this.z *= value;
			this.w *= value;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'number, Vector3 or Quaternion', 'multiply', 'Quaternion');
		}
		
		return this;
	},
	
	normalize: function() {
		this.multiply(1.0 / Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w)));
		return this;
	},
	
	get normalized() {
		return this.copy.normalize();
	},
	
	subtract: function(value) {
		if(value instanceof glacier.Quaternion) {
			this.x -= value.x;
			this.y -= value.y;
			this.z -= value.z;
			this.w -= value.w;
		} else {
			throw new glacier.exception.InvalidParameter('value', value, 'Quaternion', 'subtract', 'Quaternion');
		}
		
		return this;
	},
	
	swap: function(quat) {
		if(quat instanceof glacier.Quaternion) {
			this.x = quat.x + (quat.x = this.x, 0);
			this.y = quat.y + (quat.y = this.y, 0);
			this.z = quat.z + (quat.z = this.z, 0);
			this.w = quat.w + (quat.w = this.w, 0);
		} else {
			throw new glacier.exception.InvalidParameter('quat', quat, 'Quaternion', 'swap', 'Quaternion');
		}
	},
	
	toString: function() {
		return ('(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')');
	}
};
