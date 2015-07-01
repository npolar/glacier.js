(function() {
	function Cell(min, max, parent) {
		// Determine root
		var root = (parent.root || parent);
		while(root && root.parent) {
			root = root.parent;
		}
		
		// Define Cell properties
		Object.defineProperties(this, {
			children: { value: [] },
			max: { value: max },
			min: { value: min },
			parent: { value: parent },
			points: { value: [] },
			root: { value: root }
		});
	}
	
	Cell.prototype = {
		add: function(point) {
			if(point instanceof glacier.Vector3) {
				if(this.contains(point)) {
					if(!this.children.length) {
						if(this.points.length < this.root.cellCapacity) {
							this.points.push(point);
							return true;
						} else if(!this.split()) {
							return false;
						}
					}
					
					for(var child in this.children) {
						if((child = this.children[child]).contains(point)) {
							return child.add(point);
						}
					}
				}
			}
			
			return false;
		},
		
		clear: function() {
			this.children.length = this.points.length = 0;
		},
		
		contains: function(point) {
			if(point instanceof glacier.Vector3) {
				return (point.x >= this.min.x && point.y >= this.min.y && point.z >= this.min.z &&
						point.x <= this.max.x && point.y <= this.max.y && point.z <= this.max.z);
			}
			
			return false;
		},
		
		get level() {
			var level = 0, parent = this.parent;
			
			while(parent && (parent = parent.parent)) {
				level++;
			}
			
			return level;
		},
		
		remove: function(point) {
			if(point instanceof glacier.Vector3) {
				if(this.contains(point)) {
					var n;
					
					for(n in this.points) {
						if(this.points[n] === point) {
							this.points.splice(n, 1);
							return true;
						}
					}
					
					for(n in this.children) {
						if(this.children[n].remove(point)) {
							return true;
						}
					}
				}
			}
			
			return false;
		},
		
		split: function() {
			if(!this.children.length) {
				var min = this.min, max = this.max, cen = max.copy.subtract(min), point, cell;
					
				this.children.push(
					new Cell(new glacier.Vector3(min.x, min.y, min.z), new glacier.Vector3(cen.x, cen.y, cen.z), this),
					new Cell(new glacier.Vector3(cen.x, min.y, min.z), new glacier.Vector3(max.x, cen.y, cen.z), this),
					new Cell(new glacier.Vector3(min.x, min.y, cen.z), new glacier.Vector3(cen.x, cen.y, max.z), this),
					new Cell(new glacier.Vector3(cen.x, min.y, cen.z), new glacier.Vector3(max.x, cen.y, max.z), this),
					new Cell(new glacier.Vector3(min.x, cen.y, min.z), new glacier.Vector3(cen.x, max.y, cen.z), this),
					new Cell(new glacier.Vector3(cen.x, cen.y, min.z), new glacier.Vector3(max.x, max.y, cen.z), this),
					new Cell(new glacier.Vector3(min.x, cen.y, cen.z), new glacier.Vector3(cen.x, max.y, max.z), this),
					new Cell(new glacier.Vector3(cen.x, cen.y, cen.z), new glacier.Vector3(max.x, max.y, max.z), this)
				);
				
				return true;
			}
			
			return false;
		}
	};
	
	// TODO: Octree constructor from min/max boundaries
	function Octree(points, cellCapacity) {
		if(glacier.isArray(points, glacier.Vector3)) {
			var min = new glacier.Vector3( Infinity),
				max = new glacier.Vector3(-Infinity),
				root;
				
			// Use 8 as default cellCapacity if cellCapacity is not a number
			cellCapacity = (typeof cellCapacity == 'number' ? Math.abs(cellCapacity) : 8);
			
			Object.defineProperty(this, 'cellCapacity', {
				get: function() {
					return cellCapacity;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						cellCapacity = Math.ceil(value);
						// TODO: Rebuilt tree with new cell capacity
					}
				}
				
			});
			
			if(glacier.isArray(points, glacier.Vector3)) {
				// Calculate octree boundaries
				points.forEach(function(point) {
					min.minimize(point);
					max.maximize(point);
				});
				
				// Create root cell, and add points
				root = new Cell(min, max, this);
				points.forEach(function(point) {
					root.add(point);
				});
			}
			
			Object.defineProperty(this, 'root', { value: root });
		} else {
			throw new glacier.exception.InvalidParameter('points', points, 'Vector3 Array', '(constructor)', 'Octree');
		}
	}
	
	Octree.prototype = {
		add: function(point) {
			return this.root.add(point);
		},
		
		clear: function() {
			this.root.clear();
		},
		
		contains: function(point) {
			return this.root.contains(point);
		},
		
		get max() {
			return this.root.max;
		},
		
		get min() {
			return this.root.min;
		},
		
		get points() {
			function childPoints(cell) {
				var points = [];
				
				cell.points.forEach(function(point) {
					points.push(point);
				});
				
				cell.children.forEach(function(child) {
					childPoints(child).forEach(function(point) {
						points.push(point);
					});
				});
				
				return points;
			}
			
			return childPoints(this.root);
		},
		
		remove: function(point) {
			return this.root.remove(point);
		},
	};

	glacier.Octree = Octree;
})();
