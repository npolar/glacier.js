var glacier = {
	VERSION: "0.0.1"
};

if(typeof module == 'object') {
	module.exports = glacier;
}

glacier.isArray = function(value) {
	return (value instanceof Array || value instanceof Float32Array);
};
