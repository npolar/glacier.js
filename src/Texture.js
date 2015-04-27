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
					throw new glacier.exception.InvalidAssignment('image', typeof value, 'Image or null', 'Texture');
				}
			}
		}
	});
	
	if(typeof source == 'string') {
		this.load(source);
	} else if(source) {
		throw new glacier.exception.InvalidParameter('source', typeof source, 'Image', '(constructor)', 'Texture');
	}
};

glacier.Texture.prototype = {
	free: function() {
		this.image = null;
	},
	load: function(source) {
		if(typeof source != 'string') {
			throw new glacier.exception.InvalidParameter('source', typeof source, 'string', 'load', 'Texture');
		}
		
		var self = this, image = new Image(), c;
		
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
