(function() {
	var geoJSON = {
		// geoJSON Object super-class
		Object: function() {
		},
		
		Feature: function(geometry, properties, id) {
			this.id = (id !== undefined ? id : null);
			this.geometry = (geometry || null);
			this.properties = (typeof properties == 'object' ? properties : {});
		},
		
		FeatureCollection: function(features) {
			this.features = (features instanceof Array ? features : []);
		},
		
		GeometryCollection: function(geometries) {
			this.geometries = (geometries instanceof Array ? geometries : []);
		},
		
		LineString: function(points) {
			this.points = (points instanceof Array ? points : []);
		},
		
		MultiLineString: function(lineStrings) {
			this.lineStrings = (lineStrings instanceof Array ? lineStrings : []);
		},
		
		MultiPoint: function(points) {
			this.points = (points instanceof Array ? points : []);
		},
		
		MultiPolygon: function(polygons) {
			this.polygons = (polygons instanceof Array ? polygons : []);
		},
		
		Point: function(lat, lng, alt) {
			this.lat = (typeof lat == 'number' ? lat : 0.0);
			this.lng = (typeof lng == 'number' ? lng : 0.0);
			this.alt = (typeof alt == 'number' ? alt : undefined);
		},
		
		Polygon: function(rings) {
			this.rings = (rings instanceof Array ? rings : []);
		},
		
		parse: function(stringOrObject) {
			var geojson, data;
			
			if(typeof stringOrObject == 'string') {
				try { geojson = JSON.parse(string); }
				catch(e) { return null; }
			} else if(typeof stringOrObject == 'object') {
				geojson = stringOrObject;
			} else {
				return null;
			}
			
			return geoJSON.parseObject(geojson);
		},
		
		parseGeometry: function(geometryObject) {
			if(typeof geometryObject == 'object') {
				var object, geometries = 'Point,MultiPoint,LineString,MultiLineString,Polygon,MultiPolygon,GeometryCollection'.split(',');
				
				if(geometries.indexOf(geometryObject.type) != -1) {
					return geoJSON.parseObject(geometryObject);
				}
			}
			
			return null; // Invalid Geometry
		},
		
		parseLineString: function(points) {
			if(points instanceof Array) {
				if(points.length >= 2) {
					var lineString = [], p;
					
					for(p in points) {
						if((p = geoJSON.parsePoint(points[p]))) {
							lineString.push(p);
						}
					}
					
					if(lineString.length == points.length) {
						return new geoJSON.LineString(lineString);
					}
				}
			}
			
			return null; // Invalid LineString
		},
		
		parseMultiLineString: function(lineStrings) {
			if(lineStrings instanceof Array) {
				var multiLineString = [], l;
				
				for(l in lineStrings) {
					if((l = geoJSON.parseLineString(lineStrings[l]))) {
						multiLineString.push(l);
					}
				}
				
				if(multiLineString.length == lineStrings.length) {
					return new geoJSON.MultiLineString(multiLineString);
				}
			}
			
			return null; // Invalid MultiLineString
		},
		
		parseMultiPoint: function(points) {
			if(points instanceof Array) {
				var multiPoint = [], p;
				
				for(p in points) {
					if((p = geoJSON.parsePoint(points[p]))) {
						multiPoint.push(p);
					}
				}
				
				if(multiPoint.length == points.length) {
					return new geoJSON.MultiPoint(multiPoint);
				}
			}
			
			return null; // Invalid MultiPoint
		},
		
		parseMultiPolygon: function(polygons) {
			if(polygons instanceof Array) {
				var multiPolygon = [], p;
				
				for(p in polygons) {
					if((p = geoJSON.parsePolygon(polygons[p]))) {
						multiPolygon.push(p);
					}
				}
				
				if(multiPolygon.length == polygons.length) {
					return new geoJSON.MultiPolygon(multiPolygon);
				}
			}
			
			return null; // Invalid MultiPolygon
		},
		
		parseObject: function(object) {
			if(typeof object == 'object') {
				var data;
				
				switch(object.type) {
					case 'Point':
						if((data = geoJSON.parsePoint(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiPoint':
						if((data = geoJSON.parseMultiPoint(object.coordinates))) {
							return data;
						} break;
						
					case 'LineString':
						if((data = geoJSON.parseLineString(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiLineString':
						if((data = geoJSON.parseMultiLineString(object.coordinates))) {
							return data;
						} break;
						
					case 'Polygon':
						if((data = geoJSON.parsePolygon(object.coordinates))) {
							return data;
						} break;
						
					case 'MultiPolygon':
						if((data = geoJSON.parseMultiPolygon(object.coordinates))) {
							return data;
						} break;
						
					case 'GeometryCollection':
						if((data = geoJSON.parseGeometryCollection(object.geometries))) {
							return data;
						} break;
						
					case 'Feature':
						if((data = geoJSON.parseFeature(object))) {
							return data;
						} break;
						
					case 'FeatureCollection':
						if((data = geoJSON.parseFeatureCollection(object.features))) {
							return data;
						} break;
				}
			}
			
			return null; // Invalid GeoJSON object
		},
		
		parsePoint: function(coords) {
			if(coords instanceof Array) {
				var point = {
					lng: (typeof coords[0] == 'number' ? coords[0] : undefined),
					lat: (typeof coords[1] == 'number' ? coords[1] : undefined),
					alt: (typeof coords[2] == 'number' ? coords[2] : undefined)
				};
				
				if(point.lat !== undefined && point.lng !== undefined) {
					return new geoJSON.Point(point.lat, point.lng, point.alt);
				}
			}
			
			return null; // Invalid Point
		},
		
		parsePolygon: function(rings) {
			if(rings instanceof Array) {
				var polygon = [], r, points;
				
				for(r in rings) {
					if((r = geoJSON.parseLineString(rings[r]))) {
						if((points = r.length) >= 4 && r[0].compare(r[points - 1])) {
							polygon.push(r);
						}
					}
				}
				
				if(polygon.length == rings.length) {
					return new geoJSON.Polygon(polygon);
				}
			}
			
			return null; // Invalid Polygon
		},
		
		parseGeometryCollection: function(geometries) {
			if(geometries instanceof Array) {
				var geometryCollection = [], g;
				
				for(g in geometries) {
					if((g = geoJSON.parseGeometry(geometries[g]))) {
						geometryCollection.push(g);
					}
				}
				
				if(geometryCollection.length == geometries.length) {
					return new geoJSON.GeometryCollection(geometryCollection);
				}
			}
			
			return null; // Invalid GeometryCollection
		},
		
		parseFeature: function(featureObject) {
			if(typeof featureObject == 'object' && featureObject.type == 'Feature') {
				var geometry, properties, id = featureObject.id;
				
				if(featureObject.geometry !== null && !(geometry = geoJSON.parseGeometry(featureObject.geometry))) {
					return null; // Invalid geometry member
				}
				
				if((properties = featureObject.properties) !== null && typeof properties != 'object') {
					return null; // Invalid properties member
				}
				
				return new geoJSON.Feature(geometry, properties, id);
			}
			
			return null; // Invalid Feature
		},
		
		parseFeatureCollection: function(features) {
			if(features instanceof Array) {
				var featureCollection = [], f;
				
				for(f in features) {
					if((f = geoJSON.parseFeature(features[f]))) {
						featureCollection.push(f);
					}
				}
				
				if(featureCollection.length == features.length) {
					return new geoJSON.FeatureCollection(featureCollection);
				}
			}
			
			return null; // Invalid FeatureCollection
		}
	};
	
	// Extend geoJSON objects to inherit geoJSON.Object (super class)
	glacier.extend(geoJSON.Feature,				geoJSON.Object);
	glacier.extend(geoJSON.FeatureCollection,	geoJSON.Object);
	glacier.extend(geoJSON.GeometryCollection,	geoJSON.Object);
	glacier.extend(geoJSON.LineString,			geoJSON.Object);
	glacier.extend(geoJSON.MultiLineString, 	geoJSON.Object);
	glacier.extend(geoJSON.MultiPoint,			geoJSON.Object);
	glacier.extend(geoJSON.MultiPolygon,		geoJSON.Object);
	glacier.extend(geoJSON.Polygon,				geoJSON.Object);
	
	glacier.extend(geoJSON.Point, geoJSON.Object, {
		compare: function(point, epsilon) {
			return ((point instanceof geoJSON.Point) &&
					(Math.abs(this.lat - point.lat) <= (epsilon || 0.0)) &&
					(Math.abs(this.lng - point.lng) <= (epsilon || 0.0)) &&
					(Math.abs(this.alt - point.alt) <= (epsilon || 0.0)));
		}
	});
	
	glacier.geoJSON = geoJSON;
})();
