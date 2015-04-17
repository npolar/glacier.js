glacier.Texture = function Texture(source) {
	var image = null;
	
	Object.defineProperties(this, {
		callbacks: { value: [] },
		image: {
			get: function() {
				return image;
			},
			set: function(value) {
				if(value instanceof Image || value === null) {
					image = value;
				} else {
					glacier.error('INVALID_ASSIGNMENT', { variable: 'Texture.image', value: typeof value, expected: 'Image or null' });
				}
			}
		}
	});
	
	if(typeof source == 'string') {
		this.load(source);
	} else if(source) {
		glacier.error('INVALID_PARAMETER', { parameter: 'source', value: typeof source, expected: 'Image', method: 'Texture constructor' });
	}
};

glacier.Texture.prototype = {
	free: function() {
		this.image = null;
	},
	load: function(source) {
		if(typeof source != 'string') {
			glacier.error('INVALID_PARAMETER', { parameter: 'source', value: typeof source, expected: 'string', method: 'Texture.load' });
			return;
		}
		
		var self = this, image = new Image(), c;
		
		console.log('load tex', source);
		
		image.onload = function() {
			if(!image.width || !image.height) {
				self.image = null;
				return;
			}
			
			self.image = image;
			
			self.callbacks.forEach(function(callback) {
				if(typeof callback == 'function') {
					callback(image);
				}
			});
		};
		
		image.src = source;
	},
	onLoad: function(callback) {
		if(typeof callback == 'function') {
			this.callbacks.push(callback);
		}
		
		if(this.image) {
			callback(this.image);
		}
	},
	get height() {
		return (this.image ? this.image.height : 0);
	},
	get width() {
		return (this.image ? this.image.width : 0);
	}
};
