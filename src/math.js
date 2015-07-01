glacier.EPSILON = 10e-5;

glacier.compare = function(value1, value2, epsilon) {
	var e, val1Arr = glacier.isArray(value1), val2Arr = glacier.isArray(value2);
	
	if(typeof epsilon != 'number') {
		epsilon = glacier.EPSILON;
	}
	
	if(val1Arr && val2Arr) {
		if(value1.length == value2.length) {
			for(e = 0; e < value1.length; ++e) {
				if(typeof value1[e] == 'number' && typeof value2[e] == 'number') {
					if(Math.abs(value1[e] - value2[e]) >= epsilon) {
						return false;
					}
				} else if(value1 !== value2) {
					return false;
				}
			}
			
			return true;
		}
	} else if(val1Arr || val2Arr) {
		var arr = (val1Arr ? value1 : value2), val = (val1Arr ? value2 : value1);
		
		for(e = 0; e < arr.length; ++e) {
			if(typeof arr[e] == 'number' && typeof val == 'number') {
				if(Math.abs(arr[e] - val) >= epsilon) {
					return false;
				}
			} else if(arr[e] !== val) {
				return false;
			}
		}
		
		return true;
	} else if(typeof value1 == 'number' && typeof value2 == 'number') {
		return (Math.abs(value1 - value2) < epsilon);
	} else {
		return (value1 === value2);
	}
	
	return false;
};

glacier.degToRad = function(degrees) {
	if(typeof degrees != 'number') {
		throw new glacier.exception.InvalidParameter('degrees', degrees, 'number', 'degToRad');
	}
	
	return (degrees * Math.PI / 180.0);
};

glacier.radToDeg = function(radians) {
	if(typeof radians != 'number') {
		throw new glacier.exception.InvalidParameter('radians', radians, 'number', 'radToDeg');
	}
	
	return (radians * 180.0 / Math.PI);
};

glacier.limitAngle = function(angle, max, min) {
	if(typeof angle != 'number') {
		throw new glacier.exception.InvalidParameter('angle', angle, 'number', 'limitAngle');
	}
	
	if(typeof (max = (max === undefined ? 360.0 : max)) != 'number') {
		throw new glacier.exception.InvalidParameter('max', max, 'number', 'limitAngle');
	}
	
	if(typeof (min = (min === undefined ? 0.0 : min)) != 'number') {
		throw new glacier.exception.InvalidParameter('min', min, 'number', 'limitAngle');
	}
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	while(angle > max) {
		angle = min + (angle - max);
	}
	
	while(angle < min) {
		angle = max + (angle - min);
	}
	
	return angle;
};

glacier.clamp = function(value, min, max) {
	var args = [ 'value', 'min', 'max' ];
	[ value, min, max ].forEach(function(arg, index) {
		if(typeof arg != 'number') {
			throw new glacier.exception.InvalidParameter(args[index], arg, 'number', 'clamp');
		}
	});
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	return Math.max(min, Math.min(max, value));
};
