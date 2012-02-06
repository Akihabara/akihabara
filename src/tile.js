/**
 * AkihabaraTile module was made to deal with tile functions
 * such as get the current image on a tile map.
 * @namespace AkihabaraTile
 */
var AkihabaraTile = {
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
	* Sets a tile in the map and draws it. Does not return anything.
	* @param {Object} ctx The canvas context for the map. Accessed via AkihabaraGamebox.getCanvasContext("canvasname")
	* @param {Object} map The game map object.
	* @param {Integer} x The index of the tile column within the map array -- so a 1 would mean the second column of tiles.
	* @param {Integer} y The index of the tile row within the map array -- so a 1 would mean the second row of tiles.
	* @param {Integer} tile The integer representing the new tile you wish to draw. This is its index within the tileset; a null value will erase whatever tile is present.
	* @param {String} The ID of the map. Defaults to 'map'.
	* @example
	* // Remove the second tile to the right and down from the upper left corner of the tile map. Assumes our map canvas is called 'map_canvas'.
	* AkihabaraTile.setTileInMap(AkihabaraGamebox.getCanvasContext("map_canvas"), map, 1, 1, null, "map");
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
		AkihabaraTile.setTileInMap(ctx, tilemap, x, y, tile, map);
	}
};
