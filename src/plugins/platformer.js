/**
* The libraries for generating a 2D platformer game.
* @namespace AkihabaraPlatformer
*/
var AkihabaraPlatformer = {

	PUSH_NONE: 0,
	PUSH_LEFT: 1,
	PUSH_RIGHT: 2,

	initialize: function (th, data) {
		Akihabara.extendsFrom(
			Akihabara.extendsFrom({
				maxaccx: 5,
				maxaccy: 10,
				jumpsize: 6,
				jumpaccy: 6,
				accx: 0,
				accy: 0,
				x: 0,
				y: 0,
				frames: {},
				camera: true,
				flipv: false,
				side: false
			}, data), th
		);
		AkihabaraPlatformer.spawn(th);
	},

	spawn: function (th, data) {
		th.curjsize = 0; // current jump size
		th.counter = 0; // self counter
		th.touchedfloor = false; // touched floor
		th.touchedceil = false;
		th.touchedleftwall = false;
		th.touchedrightwall = false;
		th.pushing = AkihabaraPlatformer.PUSH_NONE; // user is moving side
		th.killed = false;
		Akihabara.copyModel(th, data);
	},

	getNextX: function (th) { return th.x + th.accx; },

	getNextY: function (th) { return th.y + AkihabaraHelp.limit(th.accy, -th.maxaccy, th.maxaccy); },

	applyGravity: function (th) {
		th.x = AkihabaraPlatformer.getNextX(th);
		th.y = AkihabaraPlatformer.getNextY(th);
	},

	horizontalKeys: function (th, keys) {
		if (AkihabaraGamebox.keyIsPressed(keys.left)) {
			th.pushing = AkihabaraPlatformer.PUSH_LEFT;
			th.accx = AkihabaraHelp.limit(th.accx - 1, -th.maxaccx, th.maxaccx);
		} else if (AkihabaraGamebox.keyIsPressed(keys.right)) {
			th.pushing = AkihabaraPlatformer.PUSH_RIGHT;
			th.accx = AkihabaraHelp.limit(th.accx + 1, -th.maxaccx, th.maxaccx);
		} else {
			th.pushing = AkihabaraPlatformer.PUSH_NONE;
		}
	},

	verticalTileCollision: function (th, map, tilemap) {
		var bottom = AkihabaraHelp.getTileInMap(th.x + (th.w / 2), th.y + th.h, map, 0, tilemap);
		var top = AkihabaraHelp.getTileInMap(th.x + (th.w / 2), th.y, map, 0, tilemap);
		th.touchedfloor = false;
		th.touchedceil = false;

		if (map.tileIsSolidCeil(th, top)) {
			th.accy = 0;
			th.y = AkihabaraHelp.yPixelToTile(map, th.y, 1);
			th.touchedceil = true;
		}
		if (map.tileIsSolidFloor(th, bottom)) {
			th.accy = 0;
			th.y = AkihabaraHelp.yPixelToTile(map, th.y + th.h) - th.h;
			th.touchedfloor = true;
		}
	},

	horizontalTileCollision: function (th, map, tilemap, precision) {
		var left = 0;
		var right = 0;
		var t = 0;

		th.touchedleftwall = false;
		th.touchedrightwall = false;

		while (t < th.h) {
			left = AkihabaraHelp.getTileInMap(th.x, th.y + t, map, 0, tilemap);
			right = AkihabaraHelp.getTileInMap(th.x + th.w - 1, th.y + t, map, 0, tilemap);

			if ((th.accx < 0) && map.tileIsSolidFloor(th, left)) {
				th.accx = 0;
				th.x = AkihabaraHelp.xPixelToTile(map, th.x - 1, 1);
				th.touchedleftwall = true;
			}
			if ((th.accx > 0) && map.tileIsSolidFloor(th, right)) {
				th.accx = 0;
				th.x = AkihabaraHelp.xPixelToTile(map, th.x + th.w) - th.w;
				th.touchedrightwall = true;
			}
			t += AkihabaraGamebox.getTiles(map.tileset).tileh / (precision ? precision : 1);
		}
	},

	/**
	* Checks if the passed object is touching the floor and can therefore jump at present.
	* @param th This is the object being checked for jump ability at the time of calling.
	*/
	canJump: function (th) {
		return th.touchedfloor;
	},

	jumpKeys: function (th, key) {
		if ((AkihabaraPlatformer.canJump(th) || (key.doublejump && (th.accy >= 0))) && AkihabaraGamebox.keyIsHit(key.jump) && (th.curjsize === 0)) {
			if (key.audiojump) { AkihabaraAudio.hitAudio(key.audiojump); }
			th.accy = -th.jumpaccy;
			th.curjsize = th.jumpsize;
			return true;
		} else if (th.curjsize && AkihabaraGamebox.keyIsHold(key.jump)) { // Jump modulation
			th.accy--;
			th.curjsize--;
		} else {
			th.curjsize = 0;
		}
		return false;
	},

	bounce: function (th, data) {
		th.curjsize = 0;
		th.accy = -data.jumpsize;
	},

	handleAccellerations: function (th) {
		// Gravity
		if (!th.touchedfloor) { th.accy++; }
		// Attrito
		if (th.pushing === AkihabaraPlatformer.PUSH_NONE) {
			if (th.accx) { th.accx = AkihabaraHelp.goToZero(th.accx); }
		}
	},

	setSide: function (th) {
		if (th.accx) { th.side = th.accx > 0; }
	},

	setFrame: function (th) {
		if (th.touchedfloor) {
			if (th.pushing !== AkihabaraPlatformer.PUSH_NONE) {
				th.frame = AkihabaraHelp.decideFrame(th.counter, th.frames.walking);
			} else {
				th.frame = AkihabaraHelp.decideFrame(th.counter, th.frames.still);
			}
		} else if (th.accy > 0) {
			th.frame = AkihabaraHelp.decideFrame(th.counter, th.frames.falling);
		} else {
			th.frame = AkihabaraHelp.decideFrame(th.counter, th.frames.jumping);
		}
	},

	/**
	* Tests to see if an object is being "jumped on" by another object.
	* @param {Object} th The object that is (possibly) being jumped on.
	* @param {Object} by The object doing the jumping-on.
	* @returns True if the two objects are overlapping enough and by.accy > 0.
	*/
	isSquished: function (th, by) {
		return ((by.accy > 0) && AkihabaraGamebox.collides(th, by) && (Math.abs(th.y - (by.y + by.h)) < (th.h / 2)));
	},

	auto: {
		// Moves on a platform. It tries to do not fall down, if specified.
		// Args: (object, {moveWhileFalling: < moves while not touching the floor > ,speed: < movement speed > })
		// Outs: the frame
		goomba: function (th, data) {
			if (data.moveWhileFalling || th.touchedfloor) {
				if (th.side) {
					th.pushing = AkihabaraPlatformer.PUSH_LEFT;
					th.accx = -data.speed;
				} else {
					th.pushing = AkihabaraPlatformer.PUSH_RIGHT;
					th.accx = data.speed;
				}
			} else {
				th.pushing = AkihabaraPlatformer.PUSH_NONE;
			}
		},
		dontFall: function (th, map, tilemap) {
			if (th.accx && th.touchedfloor) {
				var til;
				if (th.accx > 0) {
					til = AkihabaraHelp.getTileInMap(AkihabaraPlatformer.getNextX(th) + th.w - 1 + th.accx, th.y + th.h, map, 0, tilemap);
				} else {
					til = AkihabaraHelp.getTileInMap(AkihabaraPlatformer.getNextX(th), th.y + th.h, map, 0, tilemap);
				}
				if (!map.tileIsSolidFloor(th, til)) {
					th.side = !th.side;
					th.accx = 0;
				}
			}
		},
		horizontalBounce: function (th) {
			if (th.touchedleftwall || th.touchedrightwall) { th.side = !th.side; }
		}
	}
};
