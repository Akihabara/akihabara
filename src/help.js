/**
 * Help module provides some Javascript-specific functions, such object copying,
 * randomizing functions, string/array handlers.
 * @namespace AkihabaraHelp
 */
var AkihabaraHelp = {

	/**
	* Searches an object in an array filtering for one of their properties.
	* @param {Array} a The array.
	* @param {String} field The searched field.
	* @param {String} value The searched value.
	* @returns The found object, otherwise null.
	*/
	searchObject: function (a, field, value) {
		if (!a) {
			return null;
		} else {
			for (var i = 0; i < a.length; a++) {
				if (a[i][field] === value) { return a[i]; }
			}
		}
		return null;
	},

	/**
	* Generates numbers from st to ed, along with a skip value.
	* @param {Integer} st Starting number.
	* @param {Integer} ed Ending number.
	* @param {Integer} skip Number to increment by.
	* @returns An array containing the set of numbers from st to ed, incrementing by skip.
	*/
	seq: function (st, ed, skip) {
		var ret = [];
		for (var i = st; i < ed; i += (skip == null ? 1 : skip)) { ret.push(i); }
		return ret;
	},

	/**
	* Multiplies two numbers together, returning the result, unless the first parameter is less than 2, in which case it returns 1.
	* @param {Float} v First value.
	* @param {Float} mul Second value.
	* @returns An integer, v*mul, unless v < 2 in which case it returns 1.
	*/
	multiplier: function (v, mul) { // Handle a multiplier like counter. that means, 0=1 / 1=1 / 2=2*mul etc...
		return (!v || (v < 2) ? 1 : v * (!mul ? 1 : mul));
	},

	/**
	* Prepends a string with repeated instances of another string until it the result is greater than or equal to a desired length.
	* @param {String} str The string you wish to modify.
	* @param {Integer} len The desired length of your resultant string.
	* @param {String} pad The string you wish to prepend to str.
	* @returns A string whose length is no greater than len + pad.length, with pad prepending str repeatedly.
	*/
	prepad: function (str, len, pad) {
		str += "";
		while (str.length < len) {
			str = pad + str;
		}
		return str;
	},

	/**
	* Postpends a string with repeated instances of another string until it the result is greater than or equal to a desired length.
	* @param {String} str The string you wish to modify.
	* @param {Integer} len The desired length of your resultant string.
	* @param {String} pad The string you wish to postpend to str.
	* @returns A string whose length is no greater than len + pad.length, with pad postpending str repeatedly.
	*/
	postpad: function (str, len, pad) {
		str += "";
		while (str.length < len) {
			str += pad;
		}
		return str;
	},

	/**
	* Generates uniformly distributed random integers between min and min + range, non-inclusive. So AkihabaraHelp.random(0, 2) will only return 0 and 1, etc.
	* @param {Integer} min The minimum random value to be returned by the function.
	* @param {Integer} range The number of different values returned by the function.
	* @returns An integer between min (includive) and min + range (noninclusive).
	*/
	random: function (min, range) {
		return min + Math.floor(Math.random() * range);
	},

	/**
	* Determines which frame of a given animation to display. Will loop an animation.
	* @param {Integer} cnt A global frame counter.
	* @param {Object} anim An object with parameters speed (the animation speed) and frames (the array representing the animation sequence).
	* @returns The particular animation frame to display during this step.
	*/
	decideFrame: function (cnt, anim) {
		return anim.frames[Math.floor(cnt / anim.speed) % anim.frames.length];
	},

	/**
	* Determines which frame of a given animation to display. Will remain on the last frame when the animation has played once.
	* @param {Integer} cnt A global frame counter.
	* @param {Object} anim An object with parameters speed (the animation speed) and frames (the array representing the animation sequence).
	* @returns The particular animation frame to display during this step.
	*/
	decideFrameOnce: function (cnt, anim) {
		return anim.frames[(cnt >= anim.frames.length * anim.speed ? anim.frames.length - 1 : Math.floor(cnt / anim.speed))];
	},

	/**
	* Returns whether the animation was fully played at least once with decideFrame or fully with decideFrameOnce.
	* @param {Integer} cnt A global frame counter.
	* @param {Object} anim An object with parameters speed (the animation speed) and frames (the array representing the animation sequence).
	* @returns A boolean, true if the animation has been played at least once.
	*/
	isLastFrameOnce: function (cnt, anim) {
		return (cnt >= anim.frames.length * anim.speed);
	},

	/**
	* Given an incrementing value each step, this will return a value increasing from 0 until max/2, at which point it will decrement to 0, then go back up to max/2, in an endless cycle.
	* @param {Integer} counter A counter.
	* @param {Integer} max This determines the period of the function -- assuming counter is incrementing by one, a complete back-and-forth will take 'max' steps.
	* @returns An integer.
	*/
	upAndDown: function (counter, max) {
		if ((counter % max) > (max / 2)) {
			return max - (counter % max);
		} else {
			return (counter % max);
		}
	},

	/**
	* Given x, y coordinates and map information, this returns the tile at a given point.
	* @param {Integer} x An x-coordinate.
	* @param {Integer} y A y-coordinate.
	* @param {Object} map The map object.
	* @param {Object} ifout An object or value to be returned if the x, y coordinate pair is outside the map.
	* @param {String} mapid The id for the map array within the map object. Default is 'map'.
	* @returns An integer representing the value of the tile in the map array at that x, y coordinate. If there is no tile, null is returned.
	*/
	getTileInMap: function (x, y, map, ifout, mapid) {
		if (!mapid) { mapid = "map"; }
		var ts = AkihabaraGamebox._tiles[map.tileset];
		var tx = Math.floor(x / ts.tilew);
		var ty = Math.floor(y / ts.tileh);
		if ((ty < 0) || (ty >= map[mapid].length)) {
			return ifout;
		} else {
			if ((tx < 0) || (tx >= map[mapid][ty].length)) {
				return ifout;
			} else {
				return map[mapid][ty][tx];
			}
		}
	},

	/**
	* Takes an ascii-art-style array of characters and converts it to an Akihabara-compatible map format.
	* @param {Array} map An array of characters representing a map.
	* @param {Array} tra A translation array. This is an array of arrays, formatted like [ [null, char1], [0, char2], [1, char3] ] or an object, formatted like { "char1":null, "char2":0, "char3":1 }. There must at least be a null entry, followed by one numerical entry for each tile type you want to render, corresponding to the unique characters in the map array. The null entry maps a character to empty space.
	* @returns A map array formatted such that it can be attached to a map object.
	*/
	asciiArtToMap: function (map, tra) {
		if (tra instanceof Array) { //backwards compatibility
			var otra = {};
			for (var i in tra) { otra[tra[i][1]] = tra[i][0]; }
			tra = otra;
		}
		var sz, ret = [];
		for (var key in tra) { sz = key.length; break; }
		for (var y = 0; y < map.length; y++) {
			var row = [], mapy = map[y];
			for (var c = 0; c < mapy.length; c += sz) {
				row.push(tra[mapy.substr(c, sz)]);
			}
			ret.push(row);
		}
		return ret;
	},

	/**
	* Calculates and sets the width and height (map.h, map.w) and half-width and half-height (map.hh, map.hw) of a map object.
	* @param {Object} map A map object, containing a map array and a tileset array.
	* @returns A map object with map.w, map.h, map.hh, and map.hw set correctly.
	*/
	// Finalize a map definition, setting height and width in pixels etc.
	// Args: (map)
	// Outs: finalized map
	finalizeTilemap: function (map) {
		var ts = AkihabaraGamebox._tiles[map.tileset];
		map.h = map.map.length * ts.tileh;
		map.w = map.map[0].length * ts.tilew;
		map.hw = Math.floor(map.w / 2);
		map.hh = Math.floor(map.h / 2);
		return map;
	},

	/**
	* Converts an x-coordinate of a pixel to its corresponding tile x-coordinate.
	* @param {Object} map A map object, containing a map array and a tileset array.
	* @param {Integer} x An x-coordinate.
	* @param {Integer} gap (Not used.)
	* @returns A map object with map.w, map.h, map.hh, and map.hw set correctly.
	*/
	xPixelToTileX: function (map, x, gap) {
		var ts = AkihabaraGamebox._tiles[map.tileset];
		return Math.floor(x / ts.tilew);
	},

	/**
	* Converts a y-coordinate of a pixel to its corresponding tile y-coordinate.
	* @param {Object} map A map object, containing a map array and a tileset array.
	* @param {Integer} y A y-coordinate.
	* @param {Integer} gap (Not used.)
	* @returns A map object with map.w, map.h, map.hh, and map.hw set correctly.
	*/
	yPixelToTileY: function (map, y, gap) {
		var ts = AkihabaraGamebox._tiles[map.tileset];
		return Math.floor(y / ts.tileh);
	},

	/**
	* Converts an x-coordinate of a pixel to the x-coordinate of the tile column it's in. This effectively "snaps" an x coordinate to a tile edge.
	* @param {Object} map A map object, containing a map array and a tileset array.
	* @param {Integer} x An x-coordinate.
	* @param {Integer} gap Number of pixels gap in tilemap. Default is 0.
	* @returns The x-coordinate in pixels of the tile column.
	*/
	xPixelToTile: function (map, x, gap) {
		var ts = AkihabaraGamebox._tiles[map.tileset];
		return (Math.floor(x / ts.tilew) + (gap ? gap : 0)) * ts.tilew;
	},

	/**
	* Converts a y-coordinate of a pixel to the y-coordinate of the tile row it's in. This effectively "snaps" a y coordinate to a tile edge.
	* @param {Object} map A map object, containing a map array and a tileset array.
	* @param {Integer} y A y-coordinate.
	* @param {Integer} gap Number of pixels gap in tilemap. Default is 0.
	* @returns The y-coordinate in pixels of the tile row.
	*/
	yPixelToTile: function (map, y, gap) {
		var ts = AkihabaraGamebox._tiles[map.tileset];
		return (Math.floor(y / ts.tileh) + (gap ? gap : 0)) * ts.tileh;
	},

	/**
	* Limits a number to a certain range. If the number is below the minimum, the minimum is returned. If the number is above the maximum, the maximum is returned.
	* @param {Float} v A value.
	* @param {Float} min The minimum limit.
	* @param {Float} max The maximum limit.
	* @returns A value equal to v if min < v < max. Returns min if v < min, max if v > max.
	*/
	limit: function (v, min, max) {
		if (v < min) {
			return min;
		} else {
			if (v > max) {
				return max;
			} else {
				return v;
			}
		}
	},

	/**
	* Subtracts or adds 1 to a value, always converging to zero. For example, passing -3 yields -2, 5 yields 4, etc. Works best with integers.
	* @param {Integer} v A value.
	* @returns A value that is one closer to 0 on the number line than v.
	*/
	goToZero: function (v) { return (v ? v - (v / Math.abs(v)) : 0); },

	/**
	* Merges two sets of parameters together without overwriting existing parameters. This merges from model to data, and if data and model share parameters, data's values remain intact.
	* @param {Object} data An object containing a set of parameters, the destination of the merge.
	* @param {Object} model An object containing a set of parameters, the source of the merge.
	* @returns A merged model where the values of 'data' remain untouched: only new parameters and values from 'model' make it in.
	* @example
	* dst = {a: 1, b: 2, c: "three"};
	* src = {c: "three", d: "four"};
	* merged = AkihabaraHelp.mergeWithModel(dst, src);
	* merged; // => {a: 1, b: 2, c: 3, d: "four"};
	*/
	mergeWithModel: function (data, model) {
		if (data == null) { data = {}; }
		if (model != null) {
			for (var i in model) {
				if (data[i] == null) { data[i] = model[i]; }
			}
		}
		return data;
	},

	/**
	* Merges two sets of parameters together overwriting any existing parameters. This merges model- > data, and if data and model share parameters, data's are overwritten by model's.
	* @param {Object} data An object containing a set of parameters, the destination of the merge.
	* @param {Object} model An object containing a set of parameters, the source of the merge.
	* @returns A merged model where the values of 'model' take precedence over those of 'data'. The 'data' object is returned and will be an exact copy of 'model', plus any parameters that 'data' had before the merge that 'model' did not.
	* @example
	* dst = {a: 1, b: 2, c: "three"};
	* src = {c: "three", d: "four"};
	* merged = AkihabaraHelp.mergeWithModel(dst, src);
	* merged; // => {a: 1, b: 2, c: "three", d: "four"}
	*/
	copyModel: function (data, model) {
		if (data == null) { data = {}; }
		if (model != null) {
			for (var i in model) { data[i] = model[i]; }
		}
		return data;
	},

	/**
	* Creates a subset of an existing set of parameters.
	* @param {Object} obj An object containing a set of parameters, the source of the data.
	* @param {Array} attrs An array of strings, containing the names of parameters you wish to copy.
	* @returns A new set of parameters based on the subset specified.
	* @example
	* data = {a: 1, b: 2, c: "three"};
	* newdata = AkihabaraHelp.createModel(data, ["a", "c"]);
	* newdata; // => {a: 1, c: "three"}
	*/
	createModel: function (obj, attrs) {
		var ret = {};
		for (var i = 0; i < attrs.length; i++) {
			ret[attrs[i]] = obj[attrs[i]];
		}
		return ret;
	},

	/**
	* Sets a tile in the map and draws it. Does not return anything.
	* @param {Object} ctx The canvas context for the map. Accessed via AkihabaraGamebox.getCanvasContext("canvasname")
	* @param {Object} map The game map object.
	* @param {Integer} x The index of the tile column within the map array -- so a 1 would mean the second column of tiles.
	* @param {Integer} y The index of the tile row within the map array -- so a 1 would mean the second row of tiles.
	* @param {Integer} tile The integer representing the new tile you wish to draw. This is its index within the tileset; a null value will erase whatever tile is present.
	* @param {String} The ID of the map. Defaults to 'map'.
	* @example
	* // Remove the second tile to the right and down from the upper left corner of the tile map. Assumes our map canvas is called 'map_canvas'.
	* AkihabaraHelp.setTileInMap(AkihabaraGamebox.getCanvasContext("map_canvas"), map, 1, 1, null, "map");
	*/
	setTileInMap: function (ctx, tilemap, x, y, tile, map) {
		var ts = AkihabaraGamebox.getTiles(tilemap.tileset);
		tilemap[(map == null ? "map" : map)][y][x] = tile;
		if (tile == null) {
			AkihabaraGamebox.blitClear(ctx, {x: x * ts.tilew, y: y * ts.tilew, h: ts.tileh, w: ts.tilew});
		} else {
			AkihabaraGamebox.blitTile(ctx, {tileset: tilemap.tileset, tile: tile, dx: x * ts.tilew, dy: y * ts.tilew});
		}
	},

	/**
	* Sets a tile in the map and draws it using pixels as coords. Does not return anything.
	* @param {Object} ctx The canvas context for the map. Accessed via AkihabaraGamebox.getCanvasContext("canvasname")
	* @param {Object} map The game map object.
	* @param {Integer} x The index of the pixel column within the map array -- so a 1 would mean the second column of tiles.
	* @param {Integer} y The index of the pixel row within the map array -- so a 1 would mean the second row of tiles.
	* @param {Integer} tile The integer representing the new tile you wish to draw. This is its index within the tileset; a null value will erase whatever tile is present.
	* @param {String} The ID of the map. Defaults to 'map'.
	*/
	setTileInMapAtPixel: function (ctx, tilemap, x, y, tile, map) {
		var ts = AkihabaraGamebox.getTiles(tilemap.tileset);
		x = Math.floor(x / ts.tilew);
		y = Math.floor(y / ts.tileh);
		AkihabaraHelp.setTileInMap(ctx, tilemap, x, y, tile, map);
	},


	/**
	* Returns the Nth element in an array. If the array is shorter than N, it returns the last element of the array.
	* @param {Array} a An array.
	* @param {Integer} id An index to the array.
	* @returns If id > a.length, it returns a[a.length-1]. Otherwise returns a[id].
	*/
	getArrayCapped: function (a, id) {
		if (id >= a.length) {
			return a[a.length - 1];
		} else {
			return a[id];
		}
	},

	/**
	* Returns the element of a sorted array that have the highest value of one of the properties.
	* @param {Array} a An array.
	* @param {Integer} value The target value.
	* @param {String} field The property used to filter the array.
	* @returns The object with the highest target value, otherwise the first element of the array.
	*/
	getArrayIndexed: function (a, value, field) {
		if (a[0][field] == null) { return a[0]; }
		var i = 0;
		while ((value > a[i][field]) && (i !== a.length - 1)) { i++; }
		return a[i];
	}
};
