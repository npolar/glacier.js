glacier.i18n = function(code, language) {
	language = (language || glacier.language);
	
	if(glacier.i18n[language] && glacier.i18n[language][code]) {
		return glacier.i18n[language][code];
	} else if(glacier.i18n.alias[language]) {
		for(var a in glacier.i18n.alias[language]) {
			var alias = glacier.i18n.alias[language][a];
			
			if(glacier.i18n[alias] && glacier.i18n[alias][code]) {
				return glacier.i18n[alias][code];
			}
		}
	}
	
	// Use English (en) as secondary fallback
	return (glacier.i18n.en[code] || null);
};

// Primary fallback aliases
glacier.i18n.alias = {
	no: [ 'nb', 'nn' ],
	nb: [ 'nn' ],
	nn: [ 'nb' ]
};
