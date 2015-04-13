glacier.EPSILON = 10e-5;

glacier.compare = function(value1, value2) {
	var e, val1Arr = glacier.isArray(value1), val2Arr = glacier.isArray(value2);
	
	if(val1Arr && val2Arr) {
		if(value1.length == value2.length) {
			for(e = 0; e < value1.length; ++e) {
				if(typeof value1[e] == 'number' && typeof value2[e] == 'number') {
					if(Math.abs(value1[e] - value2[e]) >= glacier.EPSILON) {
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
				if(Math.abs(arr[e] - val) >= glacier.EPSILON) {
					return false;
				}
			} else if(arr[e] !== val) {
				return false;
			}
		}
		
		return true;
	} else if(typeof value1 == 'number' && typeof value2 == 'number') {
		return (Math.abs(value1 - value2) < glacier.EPSILON);
	} else {
		return (value1 === value2);
	}
	
	return false;
};

glacier.degToRad = function(degrees) {
	if(typeof degrees == 'number') {
		return (degrees * Math.PI / 180.0);
	}
	
	glacier.error('INVALID_PARAMETER', { parameter: 'degrees', value: typeof degrees, expected: 'number', method: 'degToRad' });
	return degrees;
};

glacier.radToDeg = function(radians) {
	if(typeof radians == 'number') {
		return (radians * 180.0 / Math.PI);
	}
	
	glacier.error('INVALID_PARAMETER', { parameter: 'radians', value: typeof radians, expected: 'number', method: 'radToDeg' });
	return radians;	
};

glacier.limitAngle = function(angle, max, min) {
	if(typeof angle != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'angle', value: typeof angle, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(typeof (max = (max === undefined ? 360.0 : max)) != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'max', value: typeof max, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(typeof (min = (min === undefined ? 360.0 : min)) != 'number') {
		glacier.error('INVALID_PARAMETER', { parameter: 'min', value: typeof min, expected: 'number', method: 'limitAngle' });
		return null;
	}
	
	if(max < min) {
		max = min + (min = max, 0);
	}
	
	while(angle > max) angle -= max;
	while(angle < min) angle += max;
	
	return angle;
};

glacier.clamp = function(value, min, max) {
	var args = [ 'value', 'min', 'max' ], error;
	[ value, min, max ].forEach(function(arg, index) {
		if(typeof arg != 'number') {
			glacier.error('INVALID_PARAMETER', { parameter: args[index], value: typeof arg, expected: 'number', method: 'clamp' });
			error = true;
		}
	});
	
	if(!error) {
		if(max < min) {
			max = min + (min = max, 0);
		}
		
		return Math.max(min, Math.min(max, value));
	}

	return null;
};
