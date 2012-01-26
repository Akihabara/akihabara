/**
 * Top-view RPG specific libraries.
 * @namespace AkihabaraTopview
 */

var topview = {

	// CONSTANTS
	NOOP: function () { },
	PUSH_NONE: 0,
	PUSH_LEFT: 1,
	PUSH_RIGHT: 2,
	PUSH_UP: 3,
	PUSH_DOWN: 4,

	FACES: ["up","right","down","left"],
	FACES_ANGLE: [AkihabaraTrigo.ANGLE_UP, AkihabaraTrigo.ANGLE_RIGHT, AkihabaraTrigo.ANGLE_DOWN, AkihabaraTrigo.ANGLE_LEFT],
	FACE_UP: 0,
	FACE_RIGHT: 1,
	FACE_DOWN: 2,
	FACE_LEFT: 3,

	/**
	* Checks if an object checks that both objects are on the same Z plane and if so it calls gbox.collides.
	* @param {Object} fr The object which collision is being checked for.
	* <ul>
	* <li > x{Integer}: (required)Objects x position < /li>
	* <li > y{Integer}: (required)Objects y position < /li>
	* <li > z{Integer}: (required)Objects z position < /li>
	* <li > colx{Integer}: (required)The dimension of the collision box along the x axis < /li>
	* <li > coly{Integer}: (required)The dimension of the collision box along the y axis < /li>
	* <li > colh{Integer}: (required)Collision box height < /li>
	* <li > colw{Integer}: (required)Collision box width < /li>
	* </ul>
	* @param {Object} to The object that collision is being checked against.
	* <ul>
	* <li > x{Integer}: (required)Objects x position < /li>
	* <li > y{Integer}: (required)Objects y position < /li>
	* <li > z{Integer}: (required)Objects z position < /li>
	* <li > colx{Integer}: (required)Collision x < /li>
	* <li > coly{Integer}: (required)Collision y < /li>
	* <li > colh{Integer}: (required)Collision box height < /li>
	* <li > colw{Integer}: (required)Collision box width < /li>
	* </ul>
	* @param {int} t This is the tollerance (or margin for error) on the collide function.
	*/
	collides: function (fr, to, t) { // Special collision. Counts also the Z
		if (Math.abs(fr.z, to.z) < 5) return gbox.collides({x: fr.x + fr.colx, y: fr.y + fr.coly, h: fr.colh, w: fr.colw}, {x: to.x + to.colx, y: to.y + to.coly, h: to.colh, w: to.colw}, t); else return false;
	},

	/**
	* Checks for pixel collisions with an offset to the X and Y of the colidable using colx and coly.
	* @param {Object} fr The object which collision is being tested for.
	* @param {Object} to The object (or point) which collision is being tested against.
	* @param {int} t The tollerance of the collision algorithm.
	*/
	pixelcollides: function (fr, to, t) { // Special collision. Counts also the Z
		return gbox.pixelcollides(fr, {x: to.x + to.colx, y: to.y + to.coly, h: to.colh, w: to.colw}, t);
	},

	/**
	* Initializes the game with the variables needed for topview and whatever else you feed in through data.
	* @param {Object} th Passes in the object being initialized.
	* @param {Object} data This is used to pass in everything that's being initiliized. If a value is not in Data then a default value is used instead. This can pass in values which do not have a default.
	* <ul>
	* <li > x{Integer}: x position of the object. (defaults to 0) < /li>
	* <li > y{Integer}: y position of the object. (defaults to 0) < /li>
	* <li > z{Integer}: z index of the object. (defaults to 0) < /li>
	* <li > accx{Integer}: The starting x velociyt of the object. (defaults to 0) < /li>
	* <li > accy{Integer}: The starting y velocity of the object. (defaults to 0) < /li>
	* <li > accz{Integer}: The starting z velocity of the object. (defaults to 0) < /li>
	* <li > frames{Object}: This is stores the animation frames for the objects in a map style structure. An empty map means the default image will display with no animation frames. (defaults to an empty map) < /li>
	* <li > shadow: (defaults to null) < /li> //incomplete
	* <li > maxacc{Integer}: (defaults to )4 < /li>
	* <li > controlmaxacc{Integer}: (defaults to 4) < /li>
	* <li > responsive: (defaults to 0) < /li>
	* <li > weapon: (defaults to 0) < /li>
	* <li > camera{Boolean}: (defaults to true) < /li>
	* <li > flipv{Boolean}: Notes if the object is flipped vertically(defaults to false) < /li>
	* <li > fliph{Boolean}: Notes if the object is flipped horrizontally(defaults to false) < /li>
	* <li > facing{Integer}: Stores the facing of the object. This is set with pre-defined Integer values from within topview.(defaults to topview.FACE_DOWN) < /li>
	* <ul>
	* <li > FACE_UP: 0, < /li>
	* <li > FACE_RIGHT: 1, < /li>
	* <li > FACE_DOWN: 2, < /li>
	* <li > FACE_LEFT: 3, < /li>
	* </ul>
	* <li > flipside{Boolean}: (defaults to true) < /li>
	* <li > haspushing{Boolean}: (defaults to false) < /li>
	* <li > frame: (default to 0) < /li>
	* <li > colh{Integer}: (defaults to gbox.getTiles(th.tileset).tilehh) < /li>
	* <li > colw{Integer}: (defaults to gbox.getTiles(th.tileset).tilew) < /li>
	* <li > colx{Integer}: (defaults to 0) < /li>
	* <li > staticspeed{Integer}: (defaults to 0) < /li>
	* <li > nodiagonals{Boolean}: (defaults to false) < /li>
	* <li > noreset: (defaults to false) < /li>
	* </ul>
	*/
	initialize: function (th, data) {
		Akihabara.extendsFrom(
			Akihabara.extendsFrom(
				{
					x: 0, y: 0,
					z: 0,
					accx: 0, accy: 0, accz: 0,
					frames: {},
					shadow: null,
					maxacc: 4, controlmaxacc: 4,
					responsive: 0, // Responsiveness
					weapon: 0, // Weapon
					camera: true,
					flipv: false, fliph: false,
					facing: topview.FACE_DOWN,
					flipside: true,
					haspushing: false,
					frame: 0,
					colh: gbox.getTiles(th.tileset).tilehh,
					colw: gbox.getTiles(th.tileset).tilew,
					colx: 0,
					staticspeed: 0,
					nodiagonals: false,
					noreset: false
				}, data
			), th
		);
		if (th.coly == null) th.coly = gbox.getTiles(th.tileset).tileh-th.colh;
		th.colhh = Math.floor(th.colh/2);
		th.colhw = Math.floor(th.colw/2);

		topview.spawn(th);
	},

	/**
	* Spawns a new object in the topview namespace. This also merges parameters in data into paramaters in th using help.copyModel.
	* This initializes some basic basic variables for the object and sets the Z index.
	* @param {Object} th References 'this' which is the object that called the method (generally).
	* <ul>
	* <li > y {Integer}: (required) The object's y position. < /li>
	* <li > h {Integer}: (required) The object's height. < /li>
	* </ul>
	* @param {Object} data This holds variables to be merged into th's stored info.
	*/
	spawn: function (th, data) {
		th.xpushing = topview.PUSH_NONE; // user is moving side
		th.vpushing = topview.PUSH_NONE; // user is moving side
		th.zpushing = topview.PUSH_NONE; // user is moving side
		th.counter = 0; // self counter
		th.hittimer = 0;
		th.killed = false;
		help.copyModel(th, data);
		gbox.setZindex(th, th.y + th.h); // these object follows the z-index and uses ZINDEX_LAYER
	},

	/**
	* This sets and runs the control keys for the game.
	* @param {Object} th This is the object that is being controlled by the keys (assumed to be the player)
	* <ul>
	* <li > accx: the object's currect acceleration in the x direction < /li>
	* <li > accy: the object's currect acceleration in the y direction < /li>
	* <li > responsive: minimum movement speed < /li>
	* <li > staticspeed: turns off acceleration < /li>
	* <li > nodiagonals: boolean determining if the object can move along both axis at once. < /li>
	* <li > xpushing: a boolean that notes whether the object is pushing against something in the x direction. < /li>
	* <li > ypushing: a boolean that notes whether the object is pushing against something in the y direction. < /li>
	* <li > controlmaxacc: max acceleration for the object along an axis < /li>
	* <li > noreset: checks for the object being allowed to reset its pushing status (?) < /li>
	* </ul>
	* @param {Object} keys These are the control keys being passed in for left, right, up, and down.
	* //incomplete
	*/
	controlKeys: function (th, keys) {
		var cancelx = false;
		var cancely = false;
		var idlex = false;
		var idley = false;

		if (AkihabaraInput.keyIsPressed(keys.left) || keys.pressleft) {
			th.xpushing = topview.PUSH_LEFT;
			th.facing = topview.FACE_LEFT;
			if (th.accx > th.responsive) th.accx = th.responsive;
			if (th.staticspeed) th.accx = -th.staticspeed; else th.accx = help.limit(th.accx-1, -th.controlmaxacc, th.controlmaxacc);
			if (th.nodiagonals) { cancely = true; idley = true; }
		} else if (AkihabaraInput.keyIsPressed(keys.right) || keys.pressright) {
			th.xpushing = topview.PUSH_RIGHT;
			th.facing = topview.FACE_RIGHT;
			if (th.accx < -th.responsive) th.accx = -th.responsive;
			if (th.staticspeed) th.accx = th.staticspeed; else th.accx = help.limit(th.accx + 1, -th.controlmaxacc, th.controlmaxacc);
			if (th.nodiagonals) { cancely = true; idley = true; }
		} else idlex = true;

		if (!cancely && (AkihabaraInput.keyIsPressed(keys.up) || keys.pressup)) {
			th.ypushing = topview.PUSH_UP;
			th.facing = topview.FACE_UP;
			if (th.accy > th.responsive) th.accy = th.responsive;
			if (th.staticspeed) th.accy = -th.staticspeed; else th.accy = help.limit(th.accy-1, -th.controlmaxacc, th.controlmaxacc);
			if (th.nodiagonals) { cancelx = true; idlex = true; }
		} else if (!cancely && (AkihabaraInput.keyIsPressed(keys.down) || keys.pressdown)) {
			th.ypushing = topview.PUSH_DOWN;
			th.facing = topview.FACE_DOWN;
			if (th.accy < -th.responsive) th.accy = -th.responsive;
			if (th.staticspeed) th.accy = th.staticspeed; else th.accy = help.limit(th.accy + 1, -th.controlmaxacc, th.controlmaxacc);
			if (th.nodiagonals) { cancelx = true; idlex = true; }
		} else idley = true;



		if (idlex) {
			if (cancelx) th.accx = 0;
			if (cancelx || !th.noreset) th.xpushing = topview.PUSH_NONE;
		}
		if (idley) {
			if (cancely) th.accy = 0;
			if (cancely || !th.noreset) th.ypushing = topview.PUSH_NONE;
		}
	},

	/**
	* Gets the next X position the object is going to move to.
	* @param {Object} th The object being checked.
	* <ul>
	* <li > x: the current x position of the object < /li>
	* <li > accx: the object's currect acceleration in the x direction < /li>
	* <li > maxacc: the max accleration the object can have (if accx is greater than this then this value is used instead) < /li>
	* </ul>
	*/
	getNextX: function (th) { return th.x + help.limit(th.accx, -th.maxacc, th.maxacc); },

	/**
	* Gets the next Y position the object is going to move to.
	* @param {Object} th The object being checked.
	* <ul>
	* <li > y: the current y position of the object < /li>
	* <li > accy: the object's currect acceleration in the y direction < /li>
	* <li > maxacc: the max accleration the object can have (if accy is greater than this then this value is used instead) < /li>
	* </ul>
	*/
	getNextY: function (th) { return th.y + help.limit(th.accy, -th.maxacc, th.maxacc); },

	/**
	* Gets the next Z position the object is going to move to.
	* @param {Object} th The object being checked.
	* <ul>
	* <li > z: the current z position of the object < /li>
	* <li > accz: the object's currect acceleration in the z direction < /li>
	* <li > maxacc: the max accleration the object can have (if accz is greater than this then this value is used instead) < /li>
	* </ul>
	*/
	getNextZ: function (th) { return th.z + help.limit(th.accz, -th.maxacc, th.maxacc); },

	/**
	* Sets the objects current location to its next location using the getNextX and getNextY methods.
	* @param {Object} th The object being modified.
	* <ul>
	* <li > x: the current x position of the object < /li>
	* <li > y: the current y position of the object < /li>
	* <li > accx: the object's currect acceleration in the x direction < /li>
	* <li > accy: the object's currect acceleration in the y direction < /li>
	* <li > maxacc: the max accleration the object can have (if either acceleration is greater than this then this value is used instead for that acceleration) < /li>
	* </ul>
	*/
	applyForces: function (th) {
		th.x = topview.getNextX(th);
		th.y = topview.getNextY(th);
	},

	/**
	* This applies acceleration in the Z direction (not nessesarily gravity but whatever the next accerlation on the Z axis is)
	* @param {Object} th The object being modified.
	* <ul>
	* <li > z: the current z position of the object < /li>
	* <li > accz: the object's currect acceleration in the z direction < /li>
	* <li > maxacc: the max accleration the object can have (if accz is greater than this then this value is used instead) < /li>
	* </ul>
	*/
	applyGravity: function (th) {
		th.z = topview.getNextZ(th);
	},

	/**
	* Degrades all accelerations on an object by one toward zero.
	* @param {Object} th The object being modified.
	* <ul>
	* <li > xpushing: a boolean that notes whether the object is pushing against something in the x direction. < /li>
	* <li > ypushing: a boolean that notes whether the object is pushing against something in the y direction. < /li>
	* <li > accx: the object's currect acceleration in the x direction < /li>
	* <li > accy: the object's currect acceleration in the y direction < /li>
	* </ul>
	*/
	handleAccellerations: function (th) {
		if (!th.xpushing) th.accx = help.goToZero(th.accx);
		if (!th.ypushing) th.accy = help.goToZero(th.accy);

	},

	/**
	* Increases the Z acceleration on the object by one.
	* @param {Object} th The object being modified.
	* <ul>
	* <li > accz: the acceleration on the Z axis < /li>
	* </ul>
	*/
	handleGravity: function (th) {
		th.accz++;
	},

	/**
	* This sets which frame the object is going to display based on an agregate word that describes predefined states.
	* @param {Object} th The object whose frame is being set.
	* <ul>
	* <li > xpushing: a boolean that notes whether the object is pushing against something in the x direction. < /li>
	* <li > ypushing: a boolean that notes whether the object is pushing against something in the y direction. < /li>
	* <li > haspushing: a boolean that notes if the object changes when pushing against something. < /li>
	* <li > toucheddown: a boolean that notes if the object is touching something below it on the screen. < /li>
	* <li > touchedup: a boolean that notes if the object is touching something above it on the screen. < </li>
	* <li > touchedright: a boolean that notes if the object is touching something right of it on the screen. < </li>
	* <li > touchedleft: a boolean that notes if the object is touching something left of it on the screen. < </li>
	* <li > flipside: </li>
	* <li > fliph: </li>
	* <li > facing: </li>
	* <li > frames: </li>
	* <li > frame: </li>
	* <li > counter: </li>
	* </ul>
	* // incomplete
	*/
	setFrame: function (th) {
		var pref = "stand";
		if (th.xpushing || th.ypushing)
			if (th.haspushing && (th.toucheddown || th.touchedup || th.touchedleft || th.touchedright)) pref = "pushing"; else pref = "moving";
		if (th.flipside)
			th.fliph = (th.facing == topview.FACE_RIGHT);
		th.frame = help.decideFrame(th.counter, th.frames[pref + topview.FACES[th.facing]]);
	},

	/**
	* Checks if the specified object is colliding with tiles in the map in an area defined by the object's colw and colh variables as well as the tolerance and approximation variables that are passed in through data. Only tiles in the map marked as solid are checked against. The alogrithm checks the
	* @param {Object} th The object that is being checked against the tilemap.
	* @param {Object} map This is the asci map that the tile map is generated from.
	* @param {Object} tilemap This is the array of tile objects that it itterated over checking for collisions.
	* @param {Object} defaulttile The default tile to be returned if nothing can be found. Null can be used here.
	* @param {Object} data Passes is extra dat to the function. Can be set as null.
	* <ul>
	* <li > tolerance{Integer}: This is subtracted from the collision space to get the maximum collision area for the object. This defaults to 6. < /li>
	* <li > approximation{Integer}: This is the amount that the checked values are incremented by until they reach the maximum value allowed. This defaults to 10. < /li>
	* </ul>
	*/
	tileCollision: function (th, map, tilemap, defaulttile, data) {
		th.touchedup = false;
		th.toucheddown = false;
		th.touchedleft = false;
		th.touchedright = false;

		var tolerance = (data && (data.tolerance != null)?data.tolerance: 6);
		var approximation = (data && (data.approximation != null)?data.approximation: 10);
		var t = tolerance-approximation;
		do {
			t += approximation;
			if (t > th.colw-tolerance-1) t = th.colw-tolerance-1;
			var bottom = help.getTileInMap(th.x + th.colx + t, th.y + th.coly + th.colh-1, map, defaulttile, tilemap);
			var top = help.getTileInMap(th.x + th.colx + t, th.y + th.coly, map, defaulttile, tilemap);
			if (map.tileIsSolid(th, top)) th.touchedup = true;
			if (map.tileIsSolid(th, bottom)) th.toucheddown = true;
		} while (t != th.colw-tolerance-1);

		t = tolerance-approximation;
		do {
			t += approximation;
			if (t > th.colh-tolerance-1) t = th.colh-tolerance-1;
			var left = help.getTileInMap(th.x + th.colx, th.y + th.coly + t, map, defaulttile, tilemap);
			var right = help.getTileInMap(th.x + th.colx + th.colw-1, th.y + th.coly + t, map, defaulttile, tilemap);
			if (map.tileIsSolid(th, left)) th.touchedleft = true;
			if (map.tileIsSolid(th, right)) th.touchedright = true;
		} while (t != th.colh-tolerance-1);

		if (th.touchedup) {
			th.accy = 0;
			th.y = help.yPixelToTile(map, th.y + th.coly, 1)-th.coly;
		}
		if (th.toucheddown) {
			th.accy = 0;
			th.y = help.yPixelToTile(map, th.y + th.coly + th.colh-1)-th.coly-th.colh;
		}
		if (th.touchedleft) {
			th.accx = 0;
			th.x = help.xPixelToTile(map, th.x + th.colx, 1)-th.colx;
		}
		if (th.touchedright) {
			th.accx = 0;
			th.x = help.xPixelToTile(map, th.x + th.colx + th.colw-1)-th.colx-th.colw;
		}
	},

	/**
	* @param {Object} th The object being checked for collisions.
	* <ul>
	* <li> < /li>
	* <li> < /li>
	* <li> < /li>
	* <li> < /li>
	* </ul>
	* @param {Object} data This is used to pass in other data and arguments.
	* <ul>
	* <li > group {String}: (required) This is the group of objects being checked against. < /li>
	* <li> < /li>
	* <li> < /li>
	* <li> < /li>
	* <li> < /li>
	* </ul> //incomplete
	*/
	spritewallCollision: function (th, data) {
		var wl;
		for (var i in gbox._objects[data.group]) {
			if ((!gbox._objects[data.group][i].initialize) && topview.collides(th, gbox._objects[data.group][i])) {
				wl = gbox._objects[data.group][i];
				if (topview.pixelcollides({x: th.x + th.colx, y: th.y + th.coly + th.colhh}, wl)) {
					th.touchedleft = true;
					th.accx = 0;
					th.x = wl.x + wl.colx + wl.colw-th.colx;
				} else if (topview.pixelcollides({x: th.x + th.colx + th.colw, y: th.y + th.coly + th.colhh}, wl)) {
					th.touchedright = true;
					th.accx = 0;
					th.x = wl.x + wl.colx-th.colw-th.colx;
				}
				if (topview.pixelcollides({x: th.x + th.colx + th.colhw, y: th.y + th.coly + th.colh}, wl)) {
					th.toucheddown = true;
					th.accy = 0;
					th.y = wl.y + wl.coly-th.colh-th.coly;
				} else if (topview.pixelcollides({x: th.x + th.colx + th.colhw, y: th.y + th.coly}, wl)) {
					th.touchedup = true;
					th.accy = 0;
					th.y = wl.y + wl.coly + wl.colh-th.coly;
				}
			}
		}
	},

	/**
	* This checks if the object's z index is 0 which means it has hit the floor. If this has occured it also plays an impact or bounce noise if one is passed in. Note: The area above the floor is in the negative z index space so a value of 1 for z will return that the object has collided with the floor and z will then be set to zero.
	* @param {Object} th The object being checked for collision.
	* <ul>
	* <li > touchedfloor{boolean}: This value is not passed in but is created or set in the function. This contains the function's return value. < /li>
	* <li> < /li>
	* <li> < /li>
	* <li> < /li>
	* </ul>
	* @param {Object} data This is used to pass in extra parameters.
	* <ul>
	* <li> < /li>
	* </ul>
	*/
	floorCollision: function (th, data) {
		th.touchedfloor = false;
		if (th.z > 0) {
			th.accz = (data == null?0:-Math.floor(th.accz/data.bounce));
			if (data && data.audiobounce && th.accz) AkihabaraAudio.hitAudio(data.audiobounce);
			th.z = 0;
			th.touchedfloor = true;
		}
	},

	adjustZindex: function (th) {
		gbox.setZindex(th, th.y + th.h);
	},

	// Helper: returns the ahead pixel (i.e. destination use action)
	getAheadPixel: function (th, data) {
		switch (th.facing) {
			case topview.FACE_RIGHT:
				return {x: th.x + th.colx + th.colw + data.distance, y: th.y + th.coly + th.colhh};
			case topview.FACE_LEFT:
				return {x: th.x + th.colx-data.distance, y: th.y + th.coly + th.colhh};
			case topview.FACE_UP:
				return {x: th.x + th.colx + th.colhw, y: th.y + th.coly-data.distance};
			case topview.FACE_DOWN:
				return {x: th.x + th.colx + th.colhw, y: th.y + th.coly + th.colh + data.distance};
		}
	},

	// Helper: trigger a method in colliding objects (i.e. "use action")
	callInColliding: function (th, data) {
		for (var i in gbox._objects[data.group])
			if ((!gbox._objects[data.group][i].initialize) && topview.pixelcollides(data, gbox._objects[data.group][i]))
				if (gbox._objects[data.group][i][data.call]) {
					gbox._objects[data.group][i][data.call](th);
					return i;
				}
		return false;
	},

	// Enemy methods
	wander: function (th, map, tilemap, defaulttile, data) {
		if ((!th.wandercounter) || (th.toucheddown || th.touchedup || th.touchedleft || th.touchedright)) {
			th.wandercounter = help.random(data.minstep, data.steprange);
			th.wanderdirection = help.random(0, 4);
		} else th.wandercounter--;
		switch (th.wanderdirection) {
			case topview.FACE_LEFT:
				th.xpushing = topview.PUSH_LEFT;
				th.ypushing = topview.PUSH_NONE;
				th.facing = topview.FACE_LEFT;
				th.accx = -data.speed;
				th.accy = 0;
				break;
			case topview.FACE_RIGHT:
				th.xpushing = topview.PUSH_RIGHT;
				th.ypushing = topview.PUSH_NONE;
				th.facing = topview.FACE_RIGHT;
				th.accx = data.speed;
				th.accy = 0;
				break;
			case topview.FACE_UP:
				th.ypushing = topview.PUSH_UP;
				th.xpushing = topview.PUSH_NONE;
				th.facing = topview.FACE_UP;
				th.accy = -data.speed;
				th.accx = 0;
				break;
			case topview.FACE_DOWN:
				th.ypushing = topview.PUSH_DOWN;
				th.xpushing = topview.PUSH_NONE;
				th.facing = topview.FACE_DOWN;
				th.accy = data.speed;
				th.accx = 0;
				break;
		}
	},

	// generators (firebullet specific for topdown - more complex than SHMUP one)
	fireBullet: function (gr, id, data) {
		var ts = gbox.getTiles(data.tileset);
		var obj = gbox.addObject(
			Akihabara.extendsFrom(
				{
					_bullet: true,
					zindex: 0,
					fliph: false, flipv: false,
					id: id,
					group: gr,
					cnt: 0,
					tileset: "",
					frames: {},
					acc: 0,
					angle: 0,
					camera: data.from.camera,
					accx: (data.accx == null?Math.floor(AkihabaraTrigo.translateX(0, data.angle, data.acc)):0),
					accy: (data.accy == null?Math.floor(AkihabaraTrigo.translateY(0, data.angle, data.acc)):0),
					accz: 0,
					x: (data.sidex == topview.FACE_LEFT?data.from.x-ts.tilehw: (data.sidex == topview.FACE_RIGHT?data.from.x + data.from.w-ts.tilehw: data.from.x + data.from.hw-ts.tilehw)) + (data.gapx?data.gapx: 0),
					y: (data.sidey == topview.FACE_UP?data.from.y-ts.tilehh: (data.sidey == topview.FACE_DOWN?data.from.y + data.from.h-ts.tilehh: data.from.y + data.from.hh-ts.tilehh)) + (data.gapy?data.gapy: 0),
					z: (data.from.z == null?0:data.from.z),
					collidegroup: "",
					spark: topview.NOOP,
					power: 1,
					lifetime: null,
					tilemap: null,
					defaulttile: 0,
					applyzgravity: false,
					map: null,
					mapindex: "",
					spritewalls: null,
					colx: (data.fullhit?0:null),
					coly: (data.fullhit?0:null),
					colh: (data.fullhit?ts.tileh: null),
					colw: (data.fullhit?ts.tilew: null),
					duration: null,
					onWallHit: function () {
						this.spark(this);
						gbox.trashObject(this);
					},
					bulletIsAlive: function () {
						return gbox.objectIsVisible(this);
					}
				}, data
			)
		);

		obj.initialize = function () {
			topview.initialize(this);
		};

		obj[(data.logicon == null?"first":data.logicon)] = function () {
			this.cnt = (this.cnt + 1)%10;

			if (this.applyzgravity) topview.handleGravity(this); // z-gravity
			topview.applyForces(this); // Apply forces
			if (this.applyzgravity) topview.applyGravity(this); // z-gravity
			if (this.map != null) topview.tileCollision(this, this.map, this.mapindex, this.defaulttile); // tile collisions
			if (this.spritewalls != null) topview.spritewallCollision(this, {group: this.spritewalls}); // walls collisions
			if (this.applyzgravity) topview.floorCollision(this); // Collision with the floor (for z-gravity)
			topview.adjustZindex(this);
			if (this.duration != null) {
				this.duration--;
				if (this.duration == 0) gbox.trashObject(this);
			}
			if (!this.bulletIsAlive()) gbox.trashObject(this);
			else if (this.toucheddown || this.touchedup || this.touchedleft || this.touchedright) this.onWallHit();
			else if (this.collidegroup != null) {
				for (var i in gbox._objects[this.collidegroup]) {
					if ((!gbox._objects[this.collidegroup][i].initialize) && topview.collides(this, gbox._objects[this.collidegroup][i], gbox._objects[this.collidegroup][i].tolerance)) {
						if (gbox._objects[this.collidegroup][i].hitByBullet != null)
							if (!gbox._objects[this.collidegroup][i].hitByBullet(this)) {
								this.spark(this);
								gbox.trashObject(this);
							}
					}
				}
			}
		};

		obj[(data.bliton == null?"blit":data.bliton)] = function () {
			if (!gbox.objectIsTrash(this))
				gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.cnt, this.frames), dx: this.x, dy: this.y + this.z, camera: this.camera, fliph: this.fliph, flipv: this.flipv});
		};

		gbox.setZindex(obj, obj.y + obj.h);

		return obj;

	},

	makedoor: function (gr, id, map, data) {
		var mts = gbox.getTiles(map.tileset);
		var ts = gbox.getTiles(data.tileset);

		var obj = gbox.addObject(
			Akihabara.extendsFrom(
				{
					zindex: 0,
					fliph: false, flipv: false,
					id: id,
					group: gr,
					cnt: 0,
					tileset: "",
					frames: {},
					camera: true,
					x: data.tilex*mts.tilew,
					y: data.tiley*mts.tileh,
					z: 0,
					tilemap: null,
					defaulttile: 0,
					map: map,
					colx: (data.fullhit?0:null),
					coly: (data.fullhit?0:null),
					colh: (data.fullhit?ts.tileh: null),
					colw: (data.fullhit?ts.tilew: null),
					opening: false,
					doorheight: ts.tileh,
					opencounter: 0,
					closing: false,
					audiobefore: null,
					audioafter: null,
					doOpen: function () {
						this.opening = true;
					},
					whenClosed: topview.NOOP,
					whenOpened: topview.NOOP,
					whileMoving: topview.NOOP,
					hitByBullet: function (by) {

					}
				}, data
			)
		);

		// Closing animation
		if (obj.closing) obj.opencounter = obj.doorheight;

		obj.initialize = function () {
			this.ismoving = false;
			topview.initialize(this);
		};

		obj[(data.logicon == null?"first":data.logicon)] = function () {
			if (this.closing) {
				if (!this.ismoving) {
					if (this.audiobefore) AkihabaraAudio.hitAudio(this.audiobefore);
					this.ismoving = true;
				}
				this.whileMoving();
				this.opencounter--;
				if (this.opencounter < 0) {
					if (this.audioafter) AkihabaraAudio.hitAudio(this.audioafter);
					this.ismoving = false;
					this.opencounter = 0;
					this.closing = false;
					this.whenClosed();
				}
			}
			if (this.opening) {
				if (!this.ismoving) {
					if (this.audiobefore) AkihabaraAudio.hitAudio(this.audiobefore);
					this.ismoving = true;
				}
				this.whileMoving();
				this.opencounter++;
				if (this.opencounter >= this.doorheight) {
					if (this.audioafter) AkihabaraAudio.hitAudio(this.audioafter);
					this.ismoving = false;
					if (!this.whenOpened()) gbox.trashObject(this);
				}
			}
		};

		obj[(data.bliton == null?"blit":data.bliton)] = function () {
			if (!gbox.objectIsTrash(this))
				gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.cnt, this.frames), dx: this.x, dy: this.y + this.z + this.opencounter, h: this.h-this.opencounter, camera: this.camera, fliph: this.fliph, flipv: this.flipv});
		};

		gbox.setZindex(obj, obj.y + obj.h);

		return obj;
	},
	// Set the object speed making sure that the X and Y coords are multiple of the speed. Useful on maze-based games.
	setStaticSpeed: function (th, speed) {
		th.staticspeed = speed;
		th.x = Math.round(th.x/speed)*speed;
		th.y = Math.round(th.y/speed)*speed;
	}
};
