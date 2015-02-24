var glacier = {
	VERSION: "0.0.1"
};

if(typeof module == 'object') {
	module.exports = glacier;
}

glacier.isArray = function(value) {
	return (value instanceof Array || value instanceof Float32Array);
};

glacier.union = function(members, value) {
	members = (members instanceof Array ? members : [ members ]);
	
	function addProperty(index) {
		Object.defineProperty(this, members[index], {
			get: function() { return value; },
			set: function(val) {
				if(typeof val == typeof value) {
					value = val;
				}
			}
		});
	}
	
	for(var m in members) {
		addProperty.call(this, m);
	}
};
