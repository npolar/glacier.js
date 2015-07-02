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
	
	function Octree(minOrPoints, max) {
		var min = minOrPoints, cellCapacity = 256, root;
		
		min = (min instanceof glacier.Vector3 ? min : new glacier.Vector3( Infinity));
		max = (max instanceof glacier.Vector3 ? max : new glacier.Vector3(-Infinity));
		
		if(min.length > max.length) {
			min.swap(max);
		}
		
		Object.defineProperties(this, {
			cellCapacity: {
				get: function() {
					return cellCapacity;
				},
				set: function(value) {
					if(typeof value == 'number' && value > 0) {
						cellCapacity = Math.ceil(value);
						
						// Rebuild tree with new cell capacity
						var points = this.points;
						this.clear();
						points.forEach(function(point) { root.add(point); });
					}
				}
			}
		});
		
		if(glacier.isArray(minOrPoints, glacier.Vector3)) {
			// Calculate boundaries
			minOrPoints.forEach(function(point) {
				min.minimize(point);
				max.maximize(point);
			});
			
			// Create root and add points
			root = new Cell(min, max, this);
			minOrPoints.forEach(function(point) {
				root.add(point);
			});
		} else if(min.length == Infinity) {
			throw new glacier.exception.InvalidParameter('min', min, 'finite Vector3', '(constructor)', 'Octree');
		} else if(max.length == Infinity) {
			throw new glacier.exception.InvalidParameter('max', max, 'finite Vector3', '(constructor)', 'Octree');
		}
		
		// Define root property
		Object.defineProperty(this, 'root', { value: root });
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
		
		rayPoint: function(ray, radius) {
			if(ray instanceof glacier.Ray) {
				radius = Math.abs(typeof radius == 'number' ? radius : Infinity);
				
				var closest = function(cell) {
					var dist, point, closeDist, closePoint, current, cellPos = cell.max.copy.subtract(cell.min);
					
					if(ray.boxIntersection(cell.min, cell.max)) {
						if(ray.distance(cellPos) <= radius) {
							for(point in cell.points) {
								if((dist = ray.distance((point = cell.points[point]))) <= radius) {
									if(!closeDist || dist < closeDist) {
										closePoint = point;
										closeDist = dist;
									}
								}
							}
							
							cell.children.forEach(function(child) {
								if((current = closest(child)) && current.dist < closeDist) {
									closeDist = current.dist;
									closePoint = current.point;
								}
							});
						}
					}
					
					return closePoint ? { point: closePoint, dist: closeDist } : null;
				}, current;
				
				return (current = closest(this.root)) ? current.point : null;
			}
			
			throw new glacier.exception.InvalidParameter('ray', ray, 'Ray', 'rayPoints', 'Octree');
		},
		
		remove: function(point) {
			return this.root.remove(point);
		},
	};

	glacier.Octree = Octree;
})();
