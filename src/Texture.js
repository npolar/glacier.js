glacier.Texture = function Texture(source) {
	var image = null;
	
	Object.defineProperties(this, {
		onFreeCallbacks: { value: [] },
		onLoadCallbacks: { value: [] },
		image: {
			get: function() {
				return image;
			},
			set: function(value) {
				if(value instanceof Image) {
					var self = this;
					self.image = null;
					
					(image = value).onload = function() {
						if(!image.width || !image.height) {
							image = null;
							return;
						}
						
						self.onLoadCallbacks.forEach(function(callback) {
							if(typeof callback == 'function') {
								callback(image);
							}
						});
					};
				} else if(value === null) {
					if(image) {
						this.onFreeCallbacks.forEach(function(callback) {
							if(typeof callback == 'function') {
								callback();
							}
						});
					}
					
					image = null;
				} else {
					throw new glacier.exception.InvalidAssignment('image', value, 'Image or null', 'Texture');
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
		
		this.image = new Image();
		this.image.src = source;
	},
	onFree: function(callback) {
		if(typeof callback == 'function') {
			this.onFreeCallbacks.push(callback);
		}
	},
	onLoad: function(callback) {
		if(typeof callback == 'function') {
			this.onLoadCallbacks.push(callback);
		}
	},
	get height() {
		return (this.image ? this.image.height : 0);
	},
	get width() {
		return (this.image ? this.image.width : 0);
	}
};
