var glacier = {};

(function(glacier) {
	var lang;
	
	Object.defineProperties(glacier, {
		VERSION: {
			value: '0.0.3',
			writable: false
		},
		language: {
			get: function() { return lang; },
			set: function(language) {
				if(glacier.i18n[language]) {
					lang = language;
				} else {
					var fallback = (glacier.i18n.alias[language] ? glacier.i18n.alias[language][0] : null);
					lang = (glacier.i18n[fallback] ? fallback : 'en');
					
					glacier.warn('UNDEFINED_LANGUAGE', { language: language, fallback: lang });
				}
			}
		}
	});
	
	glacier.load = function(url, callback) {
		var xhr, async = (typeof callback == 'function' ? true : false);
		
		try { xhr = new XMLHttpRequest(); }
		catch(e) { return false; }
		
		if(async) {
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && (xhr.status == 200 || xhr.status === 0)) {
					callback(xhr.responseText);
				}
			};
		}
		
		try {
			xhr.open('GET', url, async);
			xhr.overrideMimeType('text/plain');
			xhr.send();
		} catch(e) { return false; }
		
		return (async ? true : xhr.responseText);
	};
	
	glacier.log = function(message, type, params) {
		var msg = glacier.i18n(message), match;
		
		if(!msg) {
			if(type == 'warning') {
				msg = glacier.i18n('UNDEFINED_WARNING');
				params = { warning: message };
			} else if(type == 'error') {
				msg = glacier.i18n('UNDEFINED_ERROR');
				params = { error: message };
			}
		}
		
		if(typeof params == 'object' && (match = msg.match(/\{[^\}]*\}/g))) {
			for(var m in match) {
				var param = match[m].substr(1, match[m].length - 2);
				
				if(params.hasOwnProperty(param)) {
					msg = msg.replace(match[m], params[param]);
				}
			}
		}
		
		switch(type) {
			case 'error':
				console.error(msg);
				break;
			
			case 'warning':
				console.warn(msg);
				break;
			
			default:
				console.log(message);
		}
	};
	
	glacier.error = function(message, params) {
		glacier.log(message, 'error', params);
	};
	
	glacier.warn = function(message, params) {
		glacier.log(message, 'warning', params);
	};
	
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
					} else {
						glacier.error('INVALID_ASSIGNMENT', { variable: members[index], value: typeof val, expected: typeof value });
					}
				}
			});
		}
		
		for(var m in members) {
			addProperty.call(this, m);
		}
	};
	
	if(typeof module == 'object') {
		module.exports = glacier;
	}
})(glacier);
