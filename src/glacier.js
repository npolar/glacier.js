var glacier = {
	VERSION: "0.0.1",
	EPSILON: 10e-5
};

glacier.compare = function(number1, number2) {
	if(typeof number1 == 'number' && typeof number2 == 'number') {
		return (Math.abs(number1 - number2) < glacier.EPSILON);
	}
	
	return false;
};

if(typeof module == 'object') {
	module.exports = glacier;
}
