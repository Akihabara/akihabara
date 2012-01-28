var dynalist = {

	create: function () {
		return {
			test: null,
			first: null,
			last: null,
			data: [],
			dl: 0,
			gar: [],
			disconnect: function (obd) {
				if (this.data[obd].__first != null) {
					this.data[this.data[obd].__first].__next = this.data[obd].__next;
				} else {
					this.first = this.data[obd].__next;
				}
				if (this.data[obd].__next != null) {
					this.data[this.data[obd].__next].__first = this.data[obd].__first;
				} else {
					this.last = this.data[obd].__first;
				}
			},
			addObject: function (obj, prio) {
				var nid = this.gar.pop();
				if (nid == null) {
					nid = this.dl;
					this.dl++;
				}
				if (this.first == null) { // First element
					obj.__next = null;
					obj.__first = null;
					this.first = nid;
					this.last = nid;
				} else { // Chain next
					var i = this.first;
					while (i != null) {
						if (this.data[i].__prio > prio) {
							break;
						} else {
							i = this.data[i].__next;
						}
					}
					if (i == null) { // if last, chain in queue
						obj.__next = null;
						obj.__first = this.last;
						this.data[this.last].__next = nid;
						this.last = nid;
					} else { // else reconnect objects
						obj.__first = this.data[i].__first;
						obj.__next = i;
						this.data[i].__first = nid;
						if (obj.__first != null) {
							this.data[obj.__first].__next = nid;
						} else {
							this.first = nid;
						}
					}

				}
				obj.__prio = prio;
				obj.__id = nid;
				this.data[nid] = obj;
				return nid;
			},
			setPrio: function (obd, prio) {
				var i;
				if (this.data[obd].__prio === prio) { return; }
				if (this.first !== this.last) {
					if (this.data[obd].__prio < prio) {
						if (this.data[obd].__id !== this.last) {
							i = this.data[obd].__next;
							while (i != null) {
								if (this.data[i].__prio >= prio) {
									break;
								} else {
									i = this.data[i].__next;
								}
							}
							if ((i == null) || (this.data[i].__first !== this.data[obd].__id)) {
								// disconnect
								this.disconnect(obd);
								// Reconnect
								if (i == null) {
									this.data[this.last].__next = this.data[obd].__id;
									this.data[obd].__first = this.last;
									this.data[obd].__next = null;
									this.last = this.data[obd].__id;
								} else {
									this.data[obd].__first = this.data[i].__first;
									this.data[obd].__next = i;
									this.data[i].__first = this.data[obd].__id;
									if (this.data[obd].__first != null) {
										this.data[this.data[obd].__first].__next = this.data[obd].__id;
									} else {
										this.first = this.data[obd].__id;
									}
								}
							}
						}
					} else {
						if (this.data[obd].__id !== this.first) {
							i = this.data[obd].__first;
							while (i != null) {
								if (this.data[i].__prio <= prio) {
									break;
								} else {
									i = this.data[i].__first;
								}
							}
							if ((i == null) || (this.data[i].__next !== this.data[obd].__id)) {
								// disconnect
								this.disconnect(obd);
								if (i == null) {
									this.data[this.first].__first = this.data[obd].__id;
									this.data[obd].__first = null;
									this.data[obd].__next = this.first;
									this.first = this.data[obd].__id;
								} else {
									this.data[obd].__first = i;
									this.data[obd].__next = this.data[i].__next;
									this.data[i].__next = this.data[obd].__id;
									if (this.data[obd].__next != null) {
										this.data[this.data[obd].__next].__first = this.data[obd].__id;
									} else {
										this.last = this.data[obd].__id;
									}
								}
							}
						}
					}
				}
				this.data[obd].__prio = prio;
			},
			remove: function (obd) {
				this.disconnect(obd);
				this.gar.push(this.data[obd].__id);
				delete this.data[this.data[obd].__id];
			}
		};
	}
};

// A special circular queue with some features useful for the resource loader
var cyclelist = {

	create: function (size) {
		return {
			_head: 0,
			_tail: 0,
			_data: [],
			_size: (size ? size :  10),
			_total: 0,
			_done: 0,
			_current: null,
			getTotal: function () { return this._total; }, // Number of elements to be "poped"
			getDone: function () { return this._done; }, // Number of popped elements since the last empty
			getSize: function () { return this._size; }, // The maximum number of elements in the queue
			isProcessing: function () { return this._current != null; }, // The last pop was not a null (i.e. the queue returned a valid object)
			isEnded: function () { return (this._head === this._tail); }, // There are other elements in the queue
			isBusy: function () { return (this.isProcessing() || !this.isEnded()); }, // There are elements in the queue/the last one pop returned an object that is being processed
			getCurrent: function () { return this._current; }, // Return the last popped element
			push: function (d) {
				this._data[this._head] = d;
				this._head = (this._head + 1) % this._size;
				this._total++;
			},
			pop: function () {
				if (this.isEnded()) {
					this._total = 0;
					this._done = 0;
					this._current = null;
				} else {
					this._current = this._data[this._tail];
					this._tail = (this._tail + 1) % this._size;
					this._done++;
				}
				return this._current;
			},
			dump: function () {
				var r = "";
				for (var i = 0; i < this._size; i++) {
					r += i + ") " + this._data[i] + " | " + (i === this._head ? "HEAD " : "") + (i === this._tail ? "TAIL " : "") + "\n";
				}
				r += "\n\n" + this._done + "/" + this._total;
				return r;
			}
		};
	}
};

// A simple circular cache handler
var cachelist = {

	create: function (size) {
		return {
			_cache: {},
			_queue: [],
			_head: 0,
			_size: (size ? size : 10),
			add: function (k, v) {
				if (!this._cache[k]) {
					if (this._queue[this._head]) {
						delete this._cache[this._queue[this._head]];
					}
					this._queue[this._head] = k;
					this._cache[k] = {pos: this._head, value: v};
					this._head = (this._head + 1) % this._size;
				} else { this._cache[k].value = v; }
			},
			read: function (k) {
				return (this._cache[k] ? this._cache[k].value : null);
			},
			clear: function () {
				this._cache = {};
				this._queue = [];
				this._head = 0;
			}
		};
	}
};

/**
 * Gamebox module allows multiple grouped objects to move simultaneously, it helps with collisions, #
 * rendering and moving objects. It also provides monospaced pixel-font rendering, keyboard handling,
 * audio, double buffering and FSEs. Gamebox can also store and load data from cookies!
 * @namespace AkihabaraGamebox
 */
var AkihabaraGamebox = {

	// CONSTANTS
	ALIGN_CENTER: 0,
	ALIGN_MIDDLE: 0,
	ALIGN_RIGHT: 1,
	ALIGN_BOTTOM: 1,
	COLOR_BLACK: 'rgb(0, 0, 0)',
	COLOR_WHITE: 'rgb(255, 255, 255)',
	ZINDEX_LAYER: -1,
	PALETTES: { // I think that some retrogamers will find these useful and/or inspiring
		c64: { // C64 palette, picked from http: //pepto.de/projects/colorvic/
			order: ["black", "white", "red", "cyan", "purple", "green", "blue", "yellow", "orange", "brown", "lightred", "darkgray", "gray", "lightgreen", "lightblue", "lightgray"],
			colors: { black: "#000000", white: "#FFFFFF", red: "#68372B", cyan: "#70A4B2", purple: "#6F3D86", green: "#588D43", blue: "#352879", yellow: "#B8C76F", orange: "#6F4F25", brown: "#433900", lightred: "#9A6759", darkgray: "#444444", gray: "#6C6C6C", lightgreen: "#9AD284", lightblue: "#6C5EB5", lightgray: "#959595"}
		}
	},

	// VARS
	_pauseGame: false,
	_debugTool : {},
	_basepath : "akihabara/images/",
	_autoid: 0,
	_cb: null, // callback for loadAll()
	_flagstype: {
		experimental: "check",
		fse: "list",
		offlinecache: "check",
		loadscreen: "list",
		noaudio: "check"
	},
	_flags: {
		experimental: false,
		fse: "none",
		offlinecache: false,
		loadscreen: "normal",
		noaudio: false
	},
	_localflags: {},
	_fonts: {},
	_tiles: {},
	_images: {},
	_camera: {},
	_debugfont: "debugfont.png",
	getDebugFont: function () { return AkihabaraGamebox._basepath + AkihabaraGamebox._debugfont; },
	_container: '',
	_screen: 0,
	_screenCtx: null,
	_screenposition: 0,
	_screenh: 0,
	_screenw: 0,
	_screenhh: 0,
	_screenhw: 0,
	_zoom: 1,
	_canvas: {},
	_objects: {},
	_groups: [],
	_renderorder: [],
	_groupplay: {},
	_actionqueue: ["first", "then", "blit", "after"], // initialize is executed once
	_mspf: 0,
	_fps: 0,
	_gametimer: 0,
	_frameskip: 0,
	_autoskip: {min: 0, max: 5, lowidle: 0, hiidle: 5}, // minimum frameskip, maximum frameskip, minimum idle time allowed for increasing frameskip, maximum idle time allowed for decreasing frameskip
	_fskid: 0,
	_statbar: '',
	_border: 0,
	_garbage: [],
	_zindexch: [],
	_framestart: 0,
	_zindex: dynalist.create(),
	_db: false,
	_systemcookie: "__gboxsettings",
	_sessioncache: "",
	_breakcacheurl: function (a) {return (this._flags.offlinecache ? a : a + (a.indexOf("?") === -1 ? "?" : "&") + "_brc = " + AkihabaraGamebox._sessioncache); },
	_forcedidle: 0,
	_gamewaiting: 0,
	_canlog: false,
	_splash: {
		gaugeLittleColor: "rgb(255, 240, 0)",
		gaugeLittleBackColor: "rgb(255, 255, 255)",
		gaugeBorderColor: "rgb(0, 0, 0)",
		gaugeBackColor: "rgb(100, 100, 100)",
		gaugeColor: "rgb(255, 240, 0)",
		gaugeHeight: 10,
		background: null,
		minimalTime: 0,
		footnotes: null,
		footnotesSpacing: 1
	},
	_minimalexpired: 0, // 0: not triggered, 1: triggered, 2: done
	setCanLog: function (c) { this._canlog = c && window.console; },
	canLog: function () { return this._canlog; },
	log: function () {}, // Overridden if console is really available
	_safedrawimage: function (tox, img, sx, sy, sw, sh, dx, dy, dw, dh) {
		if (!img || !tox) { return; }
		if (sx < 0) { dx -= (dw / sw) * sx; sw += sx; sx = 0; }
		if (sy < 0) { dy -= (dh / sh) * sy; sh += sy; sy = 0; }
		if (sx + sw > img.width) { dw = (dw / sw) * (img.width - sx); sw = img.width - sx; }
		if (sy + sh > img.height) { dh = (dh / sh) * (img.height - sy); sh = img.height - sy; }
		try { if ((sh > 0) && (sw > 0) && (sx < img.width) && (sy < img.height)) { tox.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); } } catch (e) { }
	},
	pauseGame: function () {
		if (!AkihabaraGamebox._pauseGame) {
			AkihabaraGamebox._pauseGame = true;
		} else {
			AkihabaraGamebox._pauseGame = false;
			AkihabaraGamebox._nextframe();
		}
	},
	showPauseMessage: function () {
		AkihabaraGamebox.blitFade(AkihabaraGamebox.getBufferContext(), {alpha: 0.5});
		var ctx = AkihabaraGamebox._screenCtx;
		ctx.fillStyle = '#FFF';
		ctx.font = '12px sans-serif';
		ctx.fillText('PAUSE', 141, 125);
	},
	_domgetabsposition: function (oElement) {
		var sizes = {x: 0, y: 0, h: 0, w: 0};
		sizes.h = oElement.offsetHeight;
		sizes.w = oElement.offsetWidth;
		while (oElement != null) {
			sizes.y += oElement.offsetTop;
			sizes.x += oElement.offsetLeft;
			oElement = oElement.offsetParent;
		}
		return sizes;
	},

	/**
	* Sets the AkihabaraGamebox._forcedidle property.
	* @param {Boolean} f The value to write to AkihabaraGamebox._forcedidle.
	*/
	setForcedIdle: function (f) { this._forcedidle = f; },

	/**
	* Returns a AkihabaraGamebox flag at index f.
	* @param {Object} f The index of the flag you want returned.
	*/
	getFlag: function (f) { return this._flags[f]; },

	setScreenBorder: function (a) { this._border = a; },

	/**
	* Initializes the screen to a certain width and height, applies zoom attributes, populates the
	* body of the HTML document including the canvas element, sets an initial camera, creates a '_buffer'
	* canvas, sets keyboard event listeners, and many other initialization functions.
	* @param {Integer} w The width of the main canvas.
	* @param {Integer} h The height of the main canvas.
	*/
	initScreen: function (w, h) {
		document.body.style.textAlign = "center";
		document.body.style.height = "100%";
		document.body.style.margin = "0px";
		document.body.style.padding = "0px";
		document.getElementsByTagName("html")[0].style.height = "100%";

		var container = document.createElement("div");
		container.style.width = "100%";
		container.style.height = "100%";
		container.style.display = "table";
		this._box = document.createElement("div");
		this._box.style.display = "table-cell";
		this._box.style.width = "100%";
		this._box.style.textAlign = "center";
		this._box.style.verticalAlign = "middle";

		this._screen = document.createElement("canvas");
		this._screenCtx = this._screen.getContext('2d');
		if (this._border) { this._screen.style.border = "1px solid black"; }
		this._screen.setAttribute('height', h);
		this._screen.setAttribute('width', w);
		this._screen.style.width = (w * this._zoom) + "px";
		this._screen.style.height = (h * this._zoom) + "px";
		this._screenh = h;
		this._screenw = w;
		this._screenhh = Math.floor(h / 2);
		this._screenhw = Math.floor(w / 2);
		this._camera.x = 0;
		this._camera.y = 0;
		this._camera.h = h;
		this._camera.w = w;
		AkihabaraGamebox._container = this._box;
		this._box.appendChild(this._screen);
		container.appendChild(this._box);
		document.body.appendChild(container);

		this.createCanvas("_buffer");
		AkihabaraInput.addKeyListernerTo(AkihabaraGamebox);
		AkihabaraInput.focusDrivenKeyboardSuport(AkihabaraGamebox);

		AkihabaraInput.addTouchEventsTo(AkihabaraGamebox._screen);

		var d = new Date();
		AkihabaraGamebox._sessioncache = d.getDate() + "-" + d.getMonth() + "-" + d.getFullYear() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();

		AkihabaraGamebox._loadsettings(); // Load default configuration
		AkihabaraAudio.setCanAudio(true); // Tries to enable audio by default

		switch (AkihabaraGamebox._flags.fse) { // Initialize FSEs
		case "scanlines":
			AkihabaraGamebox.createCanvas("-gbox-fse", {w: w, h: h});
			AkihabaraGamebox.getCanvasContext("-gbox-fse").save();
			AkihabaraGamebox.getCanvasContext("-gbox-fse").globalAlpha = 0.2;
			AkihabaraGamebox.getCanvasContext("-gbox-fse").fillStyle = AkihabaraGamebox.COLOR_BLACK;
			for (var j = 0; j < h; j += 2) {
				AkihabaraGamebox.getCanvasContext("-gbox-fse").fillRect(0, j, w, 1);
			}
			AkihabaraGamebox.getCanvasContext("-gbox-fse").restore();
			AkihabaraGamebox._localflags.fse = true;
			break;
		case "lcd":
			AkihabaraGamebox.createCanvas("-gbox-fse-old", {w: w, h: h});
			AkihabaraGamebox.createCanvas("-gbox-fse-new", {w: w, h: h});
			AkihabaraGamebox._localflags.fse = true;
			break;
		}
	},

	/**
	* Sets the AkihabaraGamebox._db property. Turns on an off double buffering.
	* @param {Boolean} db The value to write to AkihabaraGamebox._db. True enables double buffering, false disables.
	*/
	setDoubleBuffering: function (db) { this._db = db; },

	/**
	* Set the frames per second rate.
	* @param {Integer} f Total frames per second for the game to run at.
	*/
	setFps: function (f) {
		this._fps = f;
		this._mspf = Math.floor(1000 / f);
	},

	/**
	* Get the frames per second rate (default is 25).
	* @returns {Integer} Returns the frames per second.
	*/
	getFps: function () { return this._fps; },
	setAutoskip: function (f) { this._autoskip = f; },
	setFrameskip: function (f) { this._frameskip = f; },

	/**
	* Get the screen height.
	* @returns {Integer} Screen height in pixels.
	*/
	getScreenH: function () { return this._screenh; },

	/**
	* Get the screen width.
	* @returns {Integer} Screen width in pixels.
	*/
	getScreenW: function () { return this._screenw; },

	/**
	* Get the screen half-height.
	* @returns {Integer} Screen half-height in pixels.
	*/
	getScreenHH: function () { return this._screenhh; },

	/**
	* Get the screen half-width.
	* @returns {Integer} Screen half-width in pixels.
	*/
	getScreenHW: function () { return this._screenhw; },

	/**
	* Sets the AkihabaraGamebox._zoom parameter, only works before AkihabaraGamebox.initScreen is called.
	* @param {Integer} z Zoom factor.
	*/
	setZoom: function (z) { this._zoom = z; },

	/**
	* Deprecated: AkihabaraGamebox._cb is now set by passing it directly into AkihabaraGamebox.loadAll(). Left in for backwards compatibility.
	* @param {String} cb The name of the function to be called once AkihabaraGamebox.loadAll is completed.
	*/
	setCallback: function (cb) { this._cb = cb; },

	_playobject: function (g, obj, a) {
		if (AkihabaraGamebox._objects[g][obj].initialize) {
			AkihabaraGamebox._objects[g][obj].initialize(obj);
			delete AkihabaraGamebox._objects[g][obj].initialize;
		}
		if (AkihabaraGamebox._objects[g][obj][a]) { AkihabaraGamebox._objects[g][obj][a](obj, a); }
	},

	_nextframe: function () {
		AkihabaraGamebox._framestart = AkihabaraGamebox._mspf - (new Date().getTime() - AkihabaraGamebox._framestart);
		if (AkihabaraGamebox._autoskip) {
			if ((AkihabaraGamebox._framestart < AkihabaraGamebox._autoskip.lowidle) && (AkihabaraGamebox._frameskip < AkihabaraGamebox._autoskip.max)) {
				AkihabaraGamebox.setFrameskip(AkihabaraGamebox._frameskip + 1);
			} else {
				if ((AkihabaraGamebox._framestart > AkihabaraGamebox._autoskip.hiidle) && (AkihabaraGamebox._frameskip > AkihabaraGamebox._autoskip.min)) {
					AkihabaraGamebox.setFrameskip(AkihabaraGamebox._frameskip - 1);
				}
			}
		}

		if (!AkihabaraGamebox._pauseGame) {
			this._gametimer = setTimeout(AkihabaraGamebox.go, (AkihabaraGamebox._framestart <= 0 ? 1 : AkihabaraGamebox._framestart));
		} else {
			AkihabaraGamebox.showPauseMessage();
		}

		if (typeof AkihabaraDebug !== "undefined") { AkihabaraDebug.run(AkihabaraGamebox._debugTool); }
	},

	/**
	* Apply FSEs to the screen. Is called each frame.
	*/
	_applyfse: function () {
		switch (AkihabaraGamebox._flags.fse) {
		case "scanlines":
			AkihabaraGamebox.getBufferContext().drawImage(AkihabaraGamebox.getCanvas("-gbox-fse"), 0, 0);
			break;
		case "lcd":
			if (AkihabaraGamebox._localflags.fselcdget && AkihabaraGamebox.getBuffer()) {
				AkihabaraGamebox.getCanvasContext("-gbox-fse-new").drawImage(AkihabaraGamebox.getBuffer(), 0, 0);
			}
			var AkihabaraGameboxBufferContext = AkihabaraGamebox.getBufferContext();
			AkihabaraGameboxBufferContext.save();
			AkihabaraGameboxBufferContext.globalAlpha = 0.5;
			AkihabaraGameboxBufferContext.drawImage(AkihabaraGamebox.getCanvas("-gbox-fse-old"), 0, 0);
			AkihabaraGameboxBufferContext.restore();
			if (AkihabaraGamebox._localflags.fselcdget) {
				AkihabaraGamebox.swapCanvas("-gbox-fse-new", "-gbox-fse-old");
			}
			AkihabaraGamebox._localflags.fselcdget = !AkihabaraGamebox._localflags.fselcdget;
			break;
		}
	},

	/**
	* Register the code that have to be executed once the page is loaded. Usually contains game initialization, resources loading etc.
	*/
	onLoad: function (code) {
		this.addEventListener(window, 'load', code);
	},

	/**
	* This function is called once per frame. This is where the basic rendering and processing of groups occurs.
	*/
	go: function () {

		if (AkihabaraGamebox._loaderqueue.isBusy()) {
			if (AkihabaraGamebox._gamewaiting === 1) {
				AkihabaraGamebox.blitFade(AkihabaraGamebox._screenCtx, {alpha: 0.5});
				AkihabaraGamebox.blitText(AkihabaraGamebox._screenCtx, {font: "_dbf", dx: 2, dy: 2, text: "LOADING..."});
				AkihabaraGamebox._gamewaiting = true;
			}
			if (AkihabaraGamebox._gamewaiting <= 1) {
				var bw = Math.floor(((AkihabaraGamebox.getScreenW() - 4) * AkihabaraGamebox._loaderqueue.getDone()) / AkihabaraGamebox._loaderqueue.getSize());
				AkihabaraGamebox._screenCtx.globalAlpha = 1;
				AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox._splash.gaugeLittleBackColor;
				AkihabaraGamebox._screenCtx.fillRect(0, 4 + AkihabaraGamebox.getFont("_dbf").tileh, AkihabaraGamebox.getScreenW(), 1);
				AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox._splash.gaugeLittleColor;
				AkihabaraGamebox._screenCtx.fillRect(0, 4 + AkihabaraGamebox.getFont("_dbf").tileh, (bw > 0 ? bw : 0), 1);
				AkihabaraGamebox._screenCtx.restore();
				AkihabaraDebug.setStatBar("Loading... (" + AkihabaraGamebox._loaderqueue.getDone() + "/" + AkihabaraGamebox._loaderqueue.getTotal() + ")");
			}
			if (AkihabaraGamebox._gamewaiting) { AkihabaraGamebox._gamewaiting--; }
			setTimeout(AkihabaraGamebox.go, 1000);
		} else {
			AkihabaraGamebox._gamewaiting = 3;
			AkihabaraGamebox._framestart = new Date().getTime();
			var i, gr = "";
			for (var g = 0; g < AkihabaraGamebox._renderorder.length; g++) {
				if (AkihabaraGamebox._groupplay[AkihabaraGamebox._renderorder[g]]) {
					if (AkihabaraGamebox._renderorder[g] === AkihabaraGamebox.ZINDEX_LAYER) {
						var id;
						for (i = 0; i < AkihabaraGamebox._actionqueue.length; i++) {
							id = AkihabaraGamebox._zindex.first;
							while (id != null) {
								if (AkihabaraGamebox._groupplay[AkihabaraGamebox._zindex.data[id].g]) {
									AkihabaraGamebox._playobject(AkihabaraGamebox._zindex.data[id].g, AkihabaraGamebox._zindex.data[id].o, AkihabaraGamebox._actionqueue[i]);
								}
								id = AkihabaraGamebox._zindex.data[id].__next;
							}
						}
					} else {
						for (i = 0; i < AkihabaraGamebox._actionqueue.length; i++) {
							for (var obj in AkihabaraGamebox._objects[AkihabaraGamebox._renderorder[g]]) {
								AkihabaraGamebox._playobject(AkihabaraGamebox._renderorder[g], obj, AkihabaraGamebox._actionqueue[i]);
							}
						}
					}
				}
			}
			if (AkihabaraGamebox._fskid >= AkihabaraGamebox._frameskip) {
				if (AkihabaraGamebox._localflags.fse) { AkihabaraGamebox._applyfse(); }
				if (AkihabaraGamebox._db) { AkihabaraGamebox.blitImageToScreen(AkihabaraGamebox.getBuffer()); }
				AkihabaraGamebox._fskid = 0;
			} else { AkihabaraGamebox._fskid++; }

			AkihabaraGamebox.purgeGarbage();

			if (AkihabaraGamebox._zindexch.length) {

				for (i = 0; i < AkihabaraGamebox._zindexch.length; i++) {
					if (AkihabaraGamebox._objects[AkihabaraGamebox._zindexch[i].o.g][AkihabaraGamebox._zindexch[i].o.o]) {
						if (AkihabaraGamebox._objects[AkihabaraGamebox._zindexch[i].o.g][AkihabaraGamebox._zindexch[i].o.o].__zt == null) {
							AkihabaraGamebox._objects[AkihabaraGamebox._zindexch[i].o.g][AkihabaraGamebox._zindexch[i].o.o].__zt = AkihabaraGamebox._zindex.addObject(AkihabaraGamebox._zindexch[i].o, AkihabaraGamebox._zindexch[i].z);
						} else {
							AkihabaraGamebox._zindex.setPrio(AkihabaraGamebox._objects[AkihabaraGamebox._zindexch[i].o.g][AkihabaraGamebox._zindexch[i].o.o].__zt, AkihabaraGamebox._zindexch[i].z);
						}
					}
				}
				AkihabaraGamebox._zindexch = [];
			}


			// Handle holding
			for (var key in AkihabaraInput._keymap) {
				if (AkihabaraInput._keyboard[AkihabaraInput._keymap[key]] === -1) {
					AkihabaraInput._keyboard[AkihabaraInput._keymap[key]] = 0;
				} else {
					if (AkihabaraInput._keyboard[AkihabaraInput._keymap[key]] && (AkihabaraInput._keyboard[AkihabaraInput._keymap[key]] < 100)) {
						AkihabaraInput._keyboard[AkihabaraInput._keymap[key]]++;
					}
				}
			}
			if (AkihabaraGamebox._forcedidle) {
				this._gametimer = setTimeout(AkihabaraGamebox._nextframe, AkihabaraGamebox._forcedidle); // Wait for the browser
			} else {
				AkihabaraGamebox._nextframe();
			}
		}
	},

	setZindex: function (th, z) {
		if ((th.__zt == null) || (th.zindex !== z)) {
			th.zindex = z;
			this._zindexch.push({o: {g: th.group, o: th.id}, z: z});
		}
	},

	_savesettings: function () {
		var saved = "";
		for (var k in this._keymap) { saved += "keymap-" + k + ":" + this._keymap[k] + "~"; }
		for (var f in this._flags) {
			switch (this._flagstype[f]) {
			case "check":
				saved += "flag-" + f + ":" + (this._flags[f] ? 1 : 0) + "~";
				break;
			case "list":
				saved += "flag-" + f + ":" + this._flags[f] + "~";
				break;
			}
		}
		this.dataSave("sys", saved);
	},
	_loadsettings: function () {
		var cfg = this.dataLoad("sys");
		if (cfg !== null) {
			cfg = cfg.split("~");
			var kv;
			var mk;
			for (var i = 0; i < cfg.length; i++) {
				kv = cfg[i].split(":");
				mk = kv[0].split("-");
				switch (mk[0]) {
				case "keymap":
					this._keymap[mk[1]] = kv[1] * 1;
					break;
				case "flag":
					switch (this._flagstype[mk[1]]) {
					case "check":
						this._flags[mk[1]] = kv[1] * 1;
						break;
					case "list":
						this._flags[mk[1]] = kv[1];
						break;
					}
					break;
				}
			}
		}
	},

	/**
	* Saves data to a browser cookie as a key-value pair, which can be restored later using AkihabaraGamebox.dataLoad. Only
	* works if user has cookies enabled.
	* @param {String} k The key which identifies the value you are storing.
	* @param {String} v The value you wish to store. Needs to be a string!
	* @param {String} d A date offset, to be added to the current date. Defines the cookie's expiration date. By default this is set to 10 years.
	* @example
	* // (from Capman)
	* AkihabaraGamebox.dataSave("capman-hiscore",maingame.hud.getNumberValue("score","value"));
	*/
	dataSave: function (k, v, d) {
		var date = new Date();
		date.setTime(date.getTime() + ((d ? d : 365 * 10) * 24 * 60 * 60 * 1000));
		document.cookie = this._systemcookie + "~" + k + " = " + v + "; expires = " + date.toGMTString() + "; path = /";
	},

	/**
	* Loads data from a browser cookie. Send it a key and it returns a value (if available). Only works if user has cookies enabled.
	* @param {String} k The key which identifies the value you are loading.
	* @param {String} a A switch to determine whether a string or a number is returned. By default a string is returned.
	* @returns {Object} A string or a number loaded from the cookie.
	* @example
	* hiscore = AkihabaraGamebox.dataLoad("hiscore");
	*/
	dataLoad: function (k, a) {
		var nameeq = this._systemcookie + "~" + k + " = ";
		var ca = document.cookie.split(";");
		var rt;
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
			if (c.indexOf(nameeq) === 0) {
				rt = c.substring(nameeq.length, c.length);
				if (a && a.number) {
					return rt * 1;
				} else {
					return rt;
				}
			}
		}
		return null;
	},

	/**
	* Clears a value stored in a  key-value pair in a browser cookie. Sets value to "". Only works if user has cookies enabled.
	* @param {String} k The key which identifies the value you are clearing.
	*/
	dataClear: function (k) { this.dataSave(k, "", -1); },

	/**
	* Gets the current camera object.
	* @returns {Object} The camera object.
	*/
	getCamera: function () { return this._camera; },

	/**
	* Sets the y value of the current camera object.
	* @param {Integer} y The camera object's new y value.
	* @param {Object} viewdata An object containing parameters h and w, which are a bounding box that the camera is
	* not supposed to leave. For example, to use your map as a bounding area for the camera, pass along {w: map.w, h: map.h}.
	*/
	setCameraY: function (y, viewdata) {
		this._camera.y = y;
		if (this._camera.y + this._camera.h > viewdata.h) { this._camera.y = viewdata.h - this._screenh; }
		if (this._camera.y < 0) { this._camera.y = 0; }
	},

	/**
	* Sets the x value of the current camera object.
	* @param {Integer} x The camera object's new x value.
	* @param {Object} viewdata An object containing parameters h and w, which are a bounding box that the camera is
	* not supposed to leave. For example, to use your map as a bounding area for the camera, pass along {w: map.w, h: map.h}.
	*/
	setCameraX: function (x, viewdata) {
		this._camera.x = x;
		if (this._camera.x + this._camera.w > viewdata.w) { this._camera.x = viewdata.w - this._screenw; }
		if (this._camera.x < 0) { this._camera.x = 0; }
	},

	/**
	* Centers the camera.
	* @param {Object} data An object containing x and y parameters -- typically the object you wish to center the camera on.
	* @param {Object} viewdata An object containing parameters h and w, which are a bounding box that the camera is
	* not supposed to leave. For example, to use your map as a bounding area for the camera, pass along {w: map.w, h: map.h}.
	* @example
	* // Center the camera on the player object
	* AkihabaraGamebox.centerCamera(AkihabaraGamebox.getObject('player', 'player_id'), {w: map.w, h: map.h});
	*/
	centerCamera: function (data, viewdata) {
		this.setCameraX(data.x - this._screenhw, viewdata);
		this.setCameraY(data.y - this._screenhh, viewdata);
	},

	/**
	* Get an array containing the names of each group in the game, in order of rendering.
	* @returns {Array} An array of group names.
	* @example
	* grouplist = AkihabaraGamebox.getGroups();
	* grouplist; // => ["background", "player", "enemy", "game"]
	*/
	getGroups: function () { return this._groups; },

	/**
	* Defines the names of each group in the game along with their rendering order.
	* @param {Array} g An array of strings of group names, in the order in which the groups should be rendered. So
	* g[0] will contain the first group to render, g[1] the second group to render, etc.
	*/
	setGroups: function (g) {
		this._groups = g;
		this._groupplay[AkihabaraGamebox.ZINDEX_LAYER] = true;
		for (var i = 0; i < g.length; i++) {
			if (!this._objects[g[i]]) {
				this._objects[g[i]] = {};
				this._groupplay[g[i]] = true;
				this._renderorder[i] = g[i];
			}
		}
	},

	/**
	* A method of setting the render order of groups independently of AkihabaraGamebox.setGroups. Sets AkihabaraGamebox._renderorder,
	* which by default is equivalent to AkihabaraGamebox._groups. However, AkihabaraGamebox._renderorder is what ultimately determines
	* the rendering order of groups. If you need to change your rendering order on the fly, use this function
	* by passing it a reordered array of group names.
	* @param {Array} g An array of strings of group names, in the order in which the groups should be rendered. So
	* g[0] will contain the first group to render, g[1] the second group to render, etc.
	*/
	setRenderOrder: function (g) { this._renderorder = g; },

	/**
	* If a group is disabled, this will enable the group.
	* @param {String} gid The id of the group.
	*/
	playGroup: function (gid) { this._groupplay[gid] = true; },

	/**
	* If a group is enabled, this will disable the group.
	* @param {String} gid The id of the group.
	*/
	stopGroup: function (gid) { this._groupplay[gid] = false; },

	/**
	* Toggles a group between enabled and disabled status.
	* @param {String} gid The id of the group.
	*/
	toggleGroup: function (gid) { this._groupplay[gid] = !this._groupplay[gid]; },

	/**
	* Turns off all groups except for the one specified.
	* @param {String} gid The id of the group.
	*/
	soloGroup: function (gid) {
		for (var i = 0; i < this._groups.length; i++) {
			if (this._groups[i] === gid) {
				this.playGroup(this._groups[i]);
			} else {
				this.stopGroup(this._groups[i]);
			}
		}
	},

	/**
	* Enables all groups, toggling any groups that are currently disabled.
	*/
	playAllGroups: function () {
		for (var i = 0; i < this._groups.length; i++) {
			this.playGroup(this._groups[i]);
		}
	},

	/**
	* Destroys all objects in a given group.
	* @param {String} gid The id of the group.
	*/
	clearGroup: function (group) {
		for (var obj in this._objects[group]) {
			if (this._objects[group][obj].__zt != null) {
				this._zindex.remove(this._objects[group][obj].__zt);
			}
			delete this._objects[group][obj];
		}
	},
	playGroups: function (gid) { for (var i = 0; i < gid.length; i++) { this.playGroup(gid[i]); }},
	stopGroups: function (gid) { for (var i = 0; i < gid.length; i++) { this.stopGroup(gid[i]); }},
	toggleGroups: function (gid) { for (var i = 0; i < gid.length; i++) { this.toggleGroup(gid[i]); }},

	/**
	* Given a group and an id for a particular object instance, this returns the instance requested.
	* <b > NOTE: < /b> this does not return a copy of the object you've requested! Any modifications you make
	* to the object returned are directly modifying the object you requested.
	* @param {String} group The id of the group that contains the object.
	* @param {String} id The id of the instance of the object.
	* @returns {Object} The object requested.
	* @example
	* // Find the player and reduce health by half.
	* playertemp = AkihabaraGamebox.getObject('player','player_id');
	* player.health = player.health/2;
	*/
	getObject: function (group, id) {return this._objects[group][id]; },

	/**
	* Creates a <font> < /font > .
	* @param {Object} data An object containing: <ul> < li > id: the id of the font < /li>
	* <li > image: reference to the font image loaded (must contain font character tiles in ASCII order) < /li>
	* <li > firstletter: the ASCII character that the font image's first character corresponds to < /li>
	* <li > tileh: height in pixels of the character tiles < /li>
	* <li > tilew: width in pixels of the character tiles < /li>
	* <li > tilerow: width in pixels of each row in the font image < /li>
	* <li > gapx: x-coord gap between tile columns, in pixels < /li>
	* <li > gapy: y-coord gap between tile rows, in pixels < /li> < /ul>
	* @example
	* AkihabaraGamebox.('font', 'font.png');
	* AkihabaraGamebox.addFont({ id: 'small', image: 'font', firstletter: ' ', tileh: 8, tilew: 8, tilerow: 255, gapx: 0, gapy: 0 });
	*/
	addFont: function (data) {
		data.tilehh = Math.floor(data.tileh / 2);
		data.tilehw = Math.floor(data.tilew / 2);
		this._fonts[data.id] = data;
		this._fonts[data.id].firstascii = data.firstletter.charCodeAt(0);
	},

	/**
	* Returns a font object containing data about the font.
	* @param {String} id The id of the font, as set in AkihabaraGamebox.addFont.
	*/
	getFont: function (id) {
		return this._fonts[id];
	},

	/**
	* Deletes an object, keeping a record of its group and id in AkihabaraGamebox._garbage.
	* @param {Object} obj The object you wish to delete.
	*/
	trashObject: function (obj) {
		if (!this._garbage[obj.group]) {
			this._garbage[obj.group] = {};
		}
		this._garbage[obj.group][obj.id] = 1;
		obj.__trashing = true;
	},

	/**
	* Clears the record held in AkihabaraGamebox._garbage of what has been deleted. The "onpurge" method is called on the object before being deleted (for canvas deallocation etc.)
	*/
	purgeGarbage: function () {
		for (var group in this._garbage) {
			for (var id in this._garbage[group]) {
				if (this._objects[group][id].onpurge) { this._objects[group][id].onpurge(); }
				if (this._objects[group][id].__zt != null) { this._zindex.remove(this._objects[group][id].__zt); }
				delete this._objects[group][id];
			}
		}
		AkihabaraGamebox._garbage = {};
	},

	/**
	* Deletes every object in a given group.
	* @param {String} group The group id.
	*/
	trashGroup: function (group) {
		if (!this._garbage[group]) { this._garbage[group] = {}; }
		for (var obj in this._objects[group]) {
			this._garbage[group][obj] = 1;
		}
	},

	/**
	* Returns whether an object is due to be trashed. Useful in cases you want to check if
	* an object is marked as trash before it is actually deleted.
	* @param {Object} o The object you're checking.
	* @returns {Boolean} True if the object is marked as trash.
	*/
	objectIsTrash: function (o) { return o.__trashing; },

	/**
	* Creates a new game object. Generally speaking you pass a fully-defined object as the parameter (including a group, id, tileset, and so on).
	* A group must be specified, or the program will crash. If no id is specified, then it will automatically provide
	* an id of 'obj-XXXX' where 'XXXX' is an automatically incrementing integer. This is where the <i > initialize < /i > , <i > first < /i > , and <i > blit < /i>
	* functions are defined, as well.
	* @param {Object} data The object you wish to create.
	* @returns {Object} The object you created.
	* @example
	* data = {
	*   group: 'player',
	*   id: 'player_id',
	*   tileset: 'player_tiles',
	*   x: 0,
	*   y: 0,
	*   initialize: function () {
	*     this.x = 10;
	*     this.y = 10;
	*   },
	* };
	* AkihabaraGamebox.addObject(data);
	*/
	addObject: function (data) {
		// Extras
		if (!data.id) {
			data.id = "obj-" + this._autoid;
			this._autoid = (this._autoid + 1) % 1000;
		}
		if (data.tileset) {
			if (data.h == null) { data.h = this._tiles[data.tileset].tileh; }
			if (data.w == null) { data.w = this._tiles[data.tileset].tilew; }
			if (data.hw == null) { data.hw = this._tiles[data.tileset].tilehw; }
			if (data.hh == null) { data.hh = this._tiles[data.tileset].tilehh; }
		}
		this._objects[data.group][data.id] = data;
		if (data.zindex != null) {
			this.setZindex(this._objects[data.group][data.id], data.zindex);
		}
		return this._objects[data.group][data.id];
	},

	/**
	* Returns whether a given group contains no objets.
	* @param {String} gid The group you're checking.
	* @returns {Boolean} True if the group contains no objects.
	*/
	groupIsEmpty: function (gid) {
		for (var i in this._objects[gid]) {
			return false;
		}
		return true;
	},

	/**
	* Creates a new canvas. By default, the width and height is the current AkihabaraGamebox._screenw and AkihabaraGamebox._screenh,
	* but it can also be set by passing in a data object with the appropriate parameters.
	* @param {String} id The id of the new canvas.
	* @param {Object} data (Optional) The height and width of the new canvas, contained in data.h and data.w parameters.
	* @example
	* AkihabaraGamebox.createCanvas('newCanvas', {w: 640, h: 480});
	*/
	createCanvas: function (id, data) {
		this.deleteCanvas(id);
		var w = (data && data.w ? data.w : this._screenw);
		var h = (data && data.h ? data.h : this._screenh);
		this._canvas[id] = document.createElement("canvas");
		this._canvas[id].setAttribute('height', h);
		this._canvas[id].setAttribute('width', w);
		var canvasCtx = this._canvas[id].getContext("2d");
		canvasCtx.save();
		canvasCtx.globalAlpha = 0;
		canvasCtx.fillStyle = AkihabaraGamebox.COLOR_BLACK;
		canvasCtx.fillRect(0, 0, w, h);
		canvasCtx.restore();
	},

	/**
	* Swap two canvas using their ID.
	* @param {String} id The id of the first canvas.
	* @param {String} id The id of the second canvas.
	* @example
	* AkihabaraGamebox.swapCanvas('canvas1','canvas2');
	*/
	swapCanvas: function (a, b) {
		var swp = this._canvas[a];
		this._canvas[a] = this._canvas[b];
		this._canvas[b] = swp;
	},

	/**
	* Deletes a given canvas.
	* @param {String} id The id of the canvas to be deleted.
	*/
	deleteCanvas: function (id) {
		if (this._canvas[id]) { delete this._canvas[id]; }
	},

	/**
	* Checks to see if an image was successfully loaded.
	* @param {String} id The id of the image.
	* @returns {Boolean} True if the image has been loaded.
	*/
	imageIsLoaded: function (id) { return this._images[id] && (this._images[id].getAttribute("wasloaded")) && this._images[id].width; },

	/**
	* Gets information about a loaded image.
	* @param {String} id The id of the image.
	* @returns {Object} A DOM Image element, including the URL and last modified date of the image, its ID, and whether it was loaded successfully.
	* @example
	* image = AkihabaraGamebox.getImage('logo');
	* image; // => <img src = ?"logo.png?_brc = 5-7-2010-15-48-42" src_org = ?"logo.png" id = ?"logo" wasloaded = ?"true" > ?
	*/
	getImage: function (id) { return this._images[id]; },

	/**
	* Gets the buffer canvas (automatically created by AkihabaraGamebox.initScreen).
	* @returns {Object} A DOM Canvas element, including the width and height of the canvas.
	*/
	getBuffer: function () { return (AkihabaraGamebox._fskid >= AkihabaraGamebox._frameskip ? (this._db ? this.getCanvas("_buffer") : this._screen) : null); },

	/**
	* Gets the buffer canvas context.
	* @returns {Object} A DOM Canvas context object.
	*/
	getBufferContext: function () { return (AkihabaraGamebox._fskid >= AkihabaraGamebox._frameskip ? (this._db ? this.getCanvasContext("_buffer") : this._screenCtx) : null); },

	/**
	* Gets a given canvas.
	* @param {Object} id The identifier of the canvas.
	* @returns {Object} A DOM Canvas element, including the width and height of the canvas.
	*/
	getCanvas: function (id) { return this._canvas[id]; },

	/**
	* Gets the two-dimensional canvas context of a given canvas. The object it returns contains all the drawing functions for the canvas.
	* See <a href = "http: //dev.w3.org/html5/spec/Overview.html#the-canvas-element" > W3C < /a> and
	* <a href = "https: //developer.mozilla.org/en/canvas_tutorial/basic_usage" > Mozilla Developer Center < /a> for details.
	* @param {Object} id The identifier of the canvas.
	* @returns {Object} A DOM Canvas context object.
	*/
	getCanvasContext: function (id) { return this.getCanvas(id).getContext("2d"); },

	/**
	* Adds an image file to the loader, assigning it to an ID. If adding an image to an existing ID, it checks to see if the file you're
	* adding is different than the one currently assigned to the ID. If it's different, it overwrites the old image. If it's the same, then
	* no action is taken.
	* @param {String} id The identifier of the image.
	* @param {String} filename The file name of the image.
	*/
	addImage: function (id, filename) {
		if (this._images[id]) {
			if (this._images[id].getAttribute("src_org") === filename) {
				return;
			} else {
				delete this._images[id];
			}
		}
		this._addtoloader({type: "image", id: id, filename: filename});
	},

	/**
	* Deletes an image currently in use. Does not delete the image file, but removes it from Akihabara's image list.
	* @param {String} id The identifier of the image.
	*/
	deleteImage: function (id) {
		delete this._images[id];
	},

	/**
	* Creates a new Akihabara tileset, adding it to the engine.
	* @param {Object} t An object containing: <ul> < li > id {String}: the new id of the tileset < /li>
	* <li > image {String}: reference to the tileset image loaded < /li>
	* <li > tileh {Integer}: height in pixels of the tiles < /li>
	* <li > tilew {Integer}: width in pixels of the tiles < /li>
	* <li > tilerow {Integer}: width in pixels of each row in the font image < /li>
	* <li > gapx {Integer}: x-coord gap between tile columns, in pixels < /li>
	* <li > gapy {Integer}: y-coord gap between tile rows, in pixels < /li> < /ul>
	*/
	addTiles: function (t) {
		t.tilehh = Math.floor(t.tileh / 2);
		t.tilehw = Math.floor(t.tilew / 2);
		this._tiles[t.id] = t;
	},

	/**
	* Gets an Akihabara tileset, adding it to the engine.
	* @param {String} t The ID of a tileset.
	* @returns An object containing: <ul> < li > id {String}: the new id of the tileset < /li>
	* <li > image {String}: reference to the tileset image loaded < /li>
	* <li > tileh {Integer}: height in pixels of the tiles < /li>
	* <li > tilew {Integer}: width in pixels of the tiles < /li>
	* <li > tilerow {Integer}: width in pixels of each row in the font image < /li>
	* <li > gapx {Integer}: x-coord gap between tile columns, in pixels < /li>
	* <li > gapy {Integer}: y-coord gap between tile rows, in pixels < /li> < /ul>
	*/
	getTiles: function (t) { return this._tiles[t]; },

	/**
	* Loads the initial splash screen and debugging font, then calls AkihabaraGamebox._waitforloaded which adds to the game all the previously
	* defined resources. Once AkihabaraGamebox._waitforloaded is done, it calls the callback function cb.
	* @params {String} cb The name of the function to be called when all assets are done loading.
	*/
	loadAll: function (cb) {
		// Setup logger
		if (this._canlog) { this.log = console.log; }
		// Set the callback function, which is called after the resources are loaded.
		if (!this._cb) { this._cb = cb; }
		// Default stuff
		this.addImage("_dbf", this.getDebugFont());
		if (this._splash.background) { this.addImage("_splash", this._splash.background); }
		AkihabaraGamebox.addFont({id: "_dbf", image: "_dbf", firstletter: " ", tileh: 5, tilew: 4, tilerow: 16, gapx: 0, gapy: 0});
		if (!AkihabaraGamebox._splash.minimalTime) { AkihabaraGamebox._minimalexpired = 2; }
		this._waitforloaded();
	},

	_implicitsargs: function (data) {
		if (data.camera) {
			data.dx -= this._camera.x;
			data.dy -= this._camera.y;
		}
		if (data.sourcecamera) {
			data.x = this._camera.x * (data.parallaxx ? data.parallaxx : 1);
			data.y = this._camera.y * (data.parallaxy ? data.parallaxy : 1);
		}
	},

	/**
	* Draws a tile to a canvas context
	* @param {Object} tox The canvas context to be drawn on.
	* @param {Object} data An object containing data about the tile to be drawn, including:
	* <ul> < li > tileset {String}: the id of the tileset < /li>
	* <li > tile {Integer}: the index of the tile within the tileset to be drawn < /li>
	* <li > dx {Integer}: x coordinate to draw the tile at < /li>
	* <li > dy {Integer}: y coordinate to draw the tile at < /li>
	* <li > fliph {Integer}: horizontal flip, either 1 or -1 < /li>
	* <li > flipv {Integer}: vertical flip, either 1 or -1 < /li>
	* <li > alpha {Float}: alpha value (0 is transparent, 1 is opaque) < /li> < /ul>
	* @example
	* // from capman, draws an current object's tile, called from inside its blit function
	* AkihabaraGamebox.blitTile(AkihabaraGamebox.getBufferContext(), {tileset: this.tileset, tile: this.frame, dx: this.x, dy: this.y, fliph: this.fliph, flipv: this.flipv, camera: this.camera, alpha: 1});
	*/
	blitTile: function (tox, data) {
		if (tox == null) { return; }
		var ts = this._tiles[data.tileset];
		var img = this.getImage(ts.image);
		this._implicitsargs(data);
		tox.save();
		tox.globalAlpha = (data.alpha ? data.alpha : 1);
		tox.translate((data.fliph ? ts.tilew : 0), (data.flipv ? ts.tileh : 0));
		tox.scale((data.fliph ? -1 : 1), (data.flipv ? -1 : 1));
		this._safedrawimage(tox, img, ts.gapx + (ts.tilew * (data.tile % ts.tilerow)), ts.gapy + (ts.tileh * Math.floor(data.tile / ts.tilerow)), (data.w == null ? ts.tilew : data.w), (data.h == null ? ts.tileh : data.h), data.dx * (data.fliph ? -1 : 1), data.dy * (data.flipv ? -1 : 1), (data.w ? data.w : ts.tilew), (data.h ? data.h : ts.tileh));
		tox.restore();
	},

	/**
	* Draws an image to a canvas context
	* @param {Object} tox The canvas context to be drawn on.
	* @param {Object} image The image to draw. Must be a DOM Image element, typicallly accessed via AkihabaraGamebox.getImage
	* @param {Object} data An object containing data about the tile to be drawn, including:
	* <ul> < li > dx {Integer}: (required) x coordinate to draw the image at < /li>
	* <li > dy {Integer}: (required) y coordinate to draw the image at < /li>
	* <li > fliph {Integer}: horizontal flip, either 1 or -1 < /li>
	* <li > flipv {Integer}: vertical flip, either 1 or -1 < /li>
	* <li > alpha {Float}: alpha value (0 is transparent, 1 is opaque) < /li> < /ul>
	* @example
	* // draw an image at (100, 100)
	* AkihabaraGamebox.blitAll(AkihabaraGamebox.getBufferContext(), AkihabaraGamebox.getImage("image_id"), {dx: 100, dy: 100});
	*/
	blitAll: function (tox, image, data) {
		if (tox == null) { return; }
		this._implicitsargs(data);
		tox.save();
		tox.globalAlpha = (data.alpha ? data.alpha : 1);
		tox.translate((data.fliph ? image.width : 0), (data.flipv ? image.height : 0));
		tox.scale((data.fliph ? -1 : 1), (data.flipv ? -1 : 1));
		this._safedrawimage(tox, image, 0, 0, image.width, image.height, data.dx * (data.fliph ? -1 : 1), data.dy * (data.flipv ? -1 : 1), image.width, image.height);
		tox.restore();
	},

	blit: function (tox, image, data) {
		if (tox == null) { return; }
		this._implicitsargs(data);
		tox.save();
		tox.globalAlpha = (data.alpha ? data.alpha : 1);
		tox.translate((data.fliph ? data.dw : 0), (data.flipv ? data.dh : 0));
		tox.scale((data.fliph ? -1 : 1), (data.flipv ? -1 : 1));
		this._safedrawimage(tox, image, (data.x ? data.x : 0), (data.y ? data.y : 0), (data.w ? data.w : data.dw), (data.h ? data.h : data.dh), data.dx * (data.fliph ? -1 : 1), data.dy * (data.flipv ? -1 : 1), data.dw, data.dh);
		tox.restore();
	},


	/**
	* Draws a tilemap to a canvas context
	* @param {Object} tox The canvas context to be drawn on.
	* @param {Object} data An object containing a set of tilemap data, including:
	* <ul> < li > tileset {String}: (required) the id of the tileset the tilemap is based on < /li>
	* <li > map {Array}: an array whose x and y coord represent the tilemap coordinates, containing integers that correspond to the index of a given tile (or null for no tile) < /li> < /ul>
	*/
	blitTilemap: function (tox, data) {
		if (tox == null) { return; }
		var ts = this._tiles[data.tileset];
		for (var y = 0; y < data.map.length; y++) {
			for (var x = 0; x < data.map[y].length; x++) {
				if (data.map[y][x] != null) {
					this.blitTile(tox, {tileset: data.tileset, tile: data.map[y][x], dx: x * ts.tilew, dy: y * ts.tilew});
				}
			}
		}
	},

	/**
	* Draws text to a canvas context
	* @param {Object} tox The canvas context to be drawn on.
	* @param {Object} data An object containing a set of data, including:
	* <ul> < li > font {String}: (required) the id of font to draw the text with < /li>
	* <li > text {String}: (required) the text to display < /li>
	* <li > dx {Integer}: (required) the x coordinate to draw the text at < /li>
	* <li > dy {Integer}: (required) the y coordinate to draw the text at < /li>
	* <li > dw {Integer}: the width of the text area -- required if you define data.halign < /li>
	* <li > dh {Integer}: the height of the text area -- required if you define data.valign < /li>
	* <li > valign {Integer}: either AkihabaraGamebox.ALIGN_BOTTOM (aligns from the bottom of the text area) or AkihabaraGamebox.ALIGN_MIDDLE (vertically centers text in text area) < /li>
	* <li > halign {Integer}: either AkihabaraGamebox.ALIGN_RIGHT (aligns to the right hand side of text area) or AkihabaraGamebox.ALIGN_CENTER (horizontallly centers text in text area) < /li>
	* <li > alpha {Float}: alpha value (0 is transparent, 1 is opaque) < /li> < /ul>
	*/
	blitText: function (tox, data) {
		if (tox == null) { return; }
		data.text += ""; // Convert to string.
		var fn = this._fonts[data.font];
		var tile = 0;
		this._implicitsargs(data);
		var dx = data.dx;
		var dy = data.dy;
		if (data.valign === AkihabaraGamebox.ALIGN_BOTTOM) {
			dy = dy + data.dh - fn.tileh;
		} else {
			if (data.valign === AkihabaraGamebox.ALIGN_MIDDLE) { dy = dy + Math.floor(data.dh / 2) - fn.tileh; }
		}
		if (data.halign === AkihabaraGamebox.ALIGN_RIGHT) {
			dx = dx + data.dw - (data.text.length * fn.tilew);
		} else {
			if (data.halign === AkihabaraGamebox.ALIGN_CENTER) { dx = dx + Math.floor((data.dw - (data.text.length * fn.tilew)) / 2); }
		}
		tox.save();
		tox.globalAlpha = (data.alpha ? data.alpha : 1);
		for (var y = 0; y < data.text.length; y++) {
			tile = data.text.charCodeAt(y) - fn.firstascii;
			if (tile >= 0) {
				if (data.clear) { tox.clearRect(dx + (y * fn.tilew), dy, (data.w ? data.w : fn.tilew), (data.h ? data.h : fn.tileh)); }
				this._safedrawimage(
					tox,
					this.getImage(fn.image),
					fn.gapx + (fn.tilew * (tile % fn.tilerow)),
					fn.gapy + (fn.tileh * Math.floor(tile / fn.tilerow)),
					fn.tilew,
					fn.tileh,
					dx + (y * fn.tilew),
					dy,
					(data.w ? data.w : fn.tilew),
					(data.h ? data.h : fn.tileh)
				);
			}
		}
		tox.restore();
	},

	/**
	* Clears a rectangular area of a canvas context.
	* @param {Object} image The canvas context to be drawn on.
	* @param {Object} data An object containing a set of data, including:
	* <ul> < li > x {Integer}: (required) the x coordinate of the top-left corner of the rectangle < /li>
	* <li > y {Integer}: (required) the y coordinate of the top-left corner of the rectangle < /li>
	* <li > w {Integer}: the width of the box; defaults to canvas width < /li>
	* <li > h {Integer}: the height the box; defaults to canvas height < /li> < /ul>
	*/
	blitClear: function (image, data) {
		if (image == null) { return; }
		if (data == null) { data = {x: 0, y: 0}; }
		this._implicitsargs(data);
		image.clearRect(data.x, data.y, (data.w == null ? image.canvas.width : data.w), (data.h == null ? image.canvas.height : data.h));
	},

	/**
	* Draws an image directly to the screen's current canvas context. Used internally in AkihabaraGamebox.go(). Probably shouldn't be used otherwise.
	*/
	blitImageToScreen: function (image) {
		this._screenCtx.drawImage(image, 0, 0);
	},

	/**
	* Draws a filled rectangle over an entire canvas context.
	* @param {Object} tox The canvas context to be filled.
	* @param {Object} data An object containing a set of data, including:
	* <ul> < li > alpha {Float}: the alpha value of the rectangle; defaults to 1 < /li>
	* <li > color {Object}: the color of the box, formatted rgb(rValue, gValue, bValue); default black < /li> < /ul>
	*/
	blitFade: function (tox, data) {
		if (tox) { this.blitRect(tox, {x: 0, y: 0, w: tox.canvas.width, h: tox.canvas.height, alpha: data.alpha, color: data.color}); }
	},

	/**
	* Draws a filled rectangle to a canvas context.
	* @param {Object} tox The canvas context to be drawn on.
	* @param {Object} data An object containing a set of data, including:
	* <ul> < li > x {Integer}: (required) the x coordinate of the top-left corner of the rectangle < /li>
	* <li > y {Integer}: (required) the y coordinate of the top-left corner of the rectangle < /li>
	* <li > w {Integer}: (required) the width of the box < /li>
	* <li > h {Integer}: (required) the height the box < /li>
	* <li > alpha {Float}: the alpha value of the rectangle; defaults to 1 < /li>
	* <li > color {Object}: the color of the box, formatted rgb(rValue, gValue, bValue); default black < /li> < /ul>
	*/
	blitRect: function (tox, data) {
		if (tox == null) { return; }
		tox.save();
		tox.globalAlpha = (data.alpha ? data.alpha : 1);
		tox.fillStyle = (data.color ? data.color: AkihabaraGamebox.COLOR_BLACK);
		tox.fillRect(data.x, data.y, data.w, data.h);
		tox.restore();
	},

	/**
	* Calculates a box collision between two collision boxes within a given tolerance. A higher tolerance means less precise collision.
	* @param {Object} o1 A collision box you're testing for collision. Must contain:
	* <ul> < li > x {Integer}: (required) the x coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > y {Integer}: (required) the y coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > w {Integer}: (required) the width of the box < /li>
	* <li > h {Integer}: (required) the height the box < /li> < /ul>
	* @param {Object} o2 A collision box you're testing for collision. Must contain:
	* <ul> < li > x {Integer}: (required) the x coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > y {Integer}: (required) the y coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > w {Integer}: (required) the width of the box < /li>
	* <li > h {Integer}: (required) the height the box < /li> < /ul>
	* @param {Integer} t The tolerance for the collision, in pixels. A value of 0 means pixel-perfect box collision. A value of 2 would mean that the
	* boxes could overlap by up to 2 pixels without being considered a collision.
	* @returns True if the two collision boxes are colliding within the given tolerance.
	*/
	collides: function (o1, o2, t) {
		if (!t) { t = 0; }
		return !((o1.y + o1.h - 1 - t < o2.y + t) || (o1.y + t > o2.y + o2.h - 1 - t) || (o1.x + o1.w - 1 - t < o2.x + t) || (o1.x + t > o2.x + o2.w - 1 - t));
	},

	/**
	* Calculates a point-box collision between a point and a collision box within a given tolerance. A higher tolerance means less precise collision.
	* @param {Object} o1 A point you're testing for collision. Must contain:
	* <ul> < li > x {Integer}: (required) the x coordinate of the point < /li>
	* <li > y {Integer}: (required) the y coordinate of the point < /li> < /ul>
	* @param {Object} o2 A collision box you're testing for collision. Must contain:
	* <ul> < li > x {Integer}: (required) the x coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > y {Integer}: (required) the y coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > w {Integer}: (required) the width of the box < /li>
	* <li > h {Integer}: (required) the height the box < /li> < /ul>
	* @param {Integer} t The tolerance for the collision, in pixels. A value of 0 means pixel-perfect collision. A value of 2 would mean that the
	* point could exist within the outermost 2 pixels of the box without being considered a collision.
	* @returns True if the point is colliding with the box within the given tolerance.
	*/
	pixelcollides: function (o1, o2, t) {
		if (!t) { t = 0; }
		return !((o1.y < o2.y + t) || (o1.y > o2.y + o2.h - 1 - t) || (o1.x < o2.x + t) || (o1.x > o2.x + o2.w - 1 - t));
	},

	/**
	* Determines whether an object is visible by seeing if it collides with the camera's viewport.
	* @param {Object} obj The object you're testing to see if it's visible. Must contain:
	* <ul> < li > x {Integer}: (required) the x coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > y {Integer}: (required) the y coordinate of the object's origin; assumes the Akihabara default of top-left being the origin < /li>
	* <li > w {Integer}: (required) the width of the object's collision box < /li>
	* <li > h {Integer}: (required) the height the object's box < /li> < /ul>
	* @returns True if the object's collision box is within the camera's viewport.
	*/
	objectIsVisible: function (obj) { return this.collides(obj, this._camera, 0); },

	_minimaltimeexpired: function () { AkihabaraGamebox._minimalexpired = 2; },
	_splashscreeniscompleted: function () { return (AkihabaraGamebox._splash.background ? AkihabaraGamebox.imageIsLoaded("_splash") : true) && (AkihabaraGamebox._splash.minilogo ? AkihabaraGamebox.imageIsLoaded("logo") : true) && (AkihabaraGamebox._splash.footnotes ? AkihabaraGamebox.imageIsLoaded("_dbf") : true); },

	setBasePath: function (a) { this._basepath = a; },
	setSplashSettings: function (a) { for (var n in a) { this._splash[n] = a[n]; } },
	setOfflineCache: function (a) { this._flags.offlinecache = a; },
	setDebugFont: function (a) { this._debugfont = a; },

	// ---
	// ---
	// ---  DYNAMIC SCRIPT INCLUSION
	// ---
	// ---

	addScript: function (call) {
		AkihabaraGamebox._addtoloader({type: "script", call: call});
	},

	// ---
	// ---
	// ---  BUNDLES
	// ---
	// ---

	addBundle: function (call) {
		AkihabaraGamebox._addtoloader({type: "bundle", call: call});
	},

	readBundleData: function (pack, call) {
		var i = 0;

		// Local resources first
		if (pack.setObject) {
			for (i = 0; i < pack.setObject.length; i++) {
				eval("(" + pack.setObject[i].object + ")")[pack.setObject[i].property] = pack.setObject[i].value;
			}
		}
		if (pack.addFont) {
			for (i = 0; i < pack.addFont.length; i++) { AkihabaraGamebox.addFont(pack.addFont[i]); }
		}
		if (pack.addTiles) {
			for (i = 0; i < pack.addTiles.length; i++) { AkihabaraGamebox.addTiles(pack.addTiles[i]); }
		}
		// Remote resources for last
		if (pack.addImage) {
			for (i = 0; i < pack.addImage.length; i++) { AkihabaraGamebox.addImage(pack.addImage[i][0], pack.addImage[i][1]); }
		}
		if (pack.addAudio) {
			for (i = 0; i < pack.addAudio.length; i++) { AkihabaraAudio.addAudio(pack.addAudio[i][0], pack.addAudio[i][1], pack.addAudio[i][2]); }
		}
		if (pack.addBundle) {
			for (i = 0; i < pack.addBundle.length; i++) { AkihabaraGamebox.addBundle(pack.addBundle[i]); }
		}
		if (pack.addScript) {
			for (i = 0; i < pack.addScript.length; i++) { AkihabaraGamebox.addScript(pack.addScript[i]); }
		}
		// Trigger the onLoad events in resource and loader
		if (pack.onLoad) {
			AkihabaraGamebox._addtoloader({type: "exec-onl", func: pack.onLoad, call: call, pack: pack});
		}
		if (call.onLoad) {
			AkihabaraGamebox._addtoloader({type: "exec-onl", func: call.onLoad, call: call, pack: pack});
		}
	},

	// ---
	// ---
	// ---  DATA LOADER
	// ---
	// ---

	_xmlhttp: null,
	_loaderqueue: cyclelist.create(200),
	_loadercache: cachelist.create(30),

	// Callback for loaded image
	_loaderimageloaded: function () {
		this.setAttribute('wasloaded', true);
		this.hheight = Math.floor(this.height / 2);
		this.hwidth = Math.floor(this.width / 2);
		AkihabaraGamebox._loaderloaded();
	},
	// Callback for loaded bundle
	_loaderhmlhttploading: function () {
		var rs = (typeof this.readyState !== "undefined" ? this.readyState : AkihabaraGamebox._xmlhttp.readyState);
		var st = (typeof this.status !== "undefined" ? this.status : AkihabaraGamebox._xmlhttp.status);
		var rt = (typeof this.responseText !== "undefined" ? this.responseText : AkihabaraGamebox._xmlhttp.responseText);
		if (rs === 4 && (!st || st === 200)) {
			if (rt) {
				if (!AkihabaraGamebox._loaderqueue.getCurrent().call.skipCacheSave) {
					AkihabaraGamebox._loadercache.add(AkihabaraGamebox._loaderqueue.getCurrent().call.file, rt);
				}
				var pack = eval("(" + rt + ")");
				AkihabaraGamebox.readBundleData(pack, AkihabaraGamebox._loaderqueue.getCurrent().call);
				// Keep loading the other resources.
				AkihabaraGamebox._loaderloaded();
			}
		}
	},

	// Loader code
	_addtoloader: function (d) { // type: xx, data: yy
		AkihabaraGamebox._loaderqueue.push(d);
		if (!AkihabaraGamebox._loaderqueue.isProcessing()) { AkihabaraGamebox._loadnext(); }
	},
	_loaderloaded: function () {
		setTimeout(AkihabaraGamebox._loadnext, 10);
	},
	_loaderscript: function () {
		if (AkihabaraGamebox._loaderqueue.getCurrent().call.onLoad) {
			AkihabaraGamebox._addtoloader({type: "exec-onl", func: AkihabaraGamebox._loaderqueue.getCurrent().call.onLoad, call: AkihabaraGamebox._loaderqueue.getCurrent().call});
		}
		AkihabaraGamebox._loadnext();
	},
	_loadnext: function () {
		var current = AkihabaraGamebox._loaderqueue.pop();
		if (AkihabaraGamebox._loaderqueue.isProcessing()) {
			switch (AkihabaraGamebox._loaderqueue.getCurrent().type) {
			case "image":
				AkihabaraGamebox._images[current.id] = new Image();
				AkihabaraGamebox.addEventListener(AkihabaraGamebox._images[current.id], 'load', AkihabaraGamebox._loaderimageloaded);
				AkihabaraGamebox._images[current.id].src = AkihabaraGamebox._breakcacheurl(current.filename);
				AkihabaraGamebox._images[current.id].setAttribute('src_org', current.filename);
				AkihabaraGamebox._images[current.id].setAttribute('id', current.id);
				AkihabaraGamebox._images[current.id].setAttribute('wasloaded', false);
				break;
			case "bundle":
				var done = false;
				if (!current.call.skipCacheLoad) {
					var data = AkihabaraGamebox._loadercache.read(current.call.file);
					if (data) {
						var pack = eval("(" + data + ")");
						AkihabaraGamebox.readBundleData(pack, current.call);
						// Keep loading the other resources.
						AkihabaraGamebox._loaderloaded();
						done = true;
					}
				}
				if (!done) {
					AkihabaraGamebox._xmlhttp = AkihabaraGamebox.createXmlHttpRequest();
					AkihabaraGamebox._xmlhttp.open((current.call.data ? "POST" : "GET"), AkihabaraGamebox._breakcacheurl(current.call.file), true);
					AkihabaraGamebox._xmlhttp.onreadystatechange = AkihabaraGamebox._loaderhmlhttploading;
					if (current.call.data) {
						AkihabaraGamebox._xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						AkihabaraGamebox._xmlhttp.send(current.call.data);
					} else { AkihabaraGamebox._xmlhttp.send(); }
				}
				break;
			case "audio":
				AkihabaraAudio._createnextaudio(current.data);
				break;
			case "exec-onl":
				current.func(current.call, current.pack);
				AkihabaraGamebox._loaderloaded();
				break;
			case "script":
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.onload = AkihabaraGamebox._loaderscript;
				script.src = current.call.file;
				document.getElementsByTagName('body')[0].appendChild(script);
				break;
			}
		}
	},
	_waitforloaded: function () {
		var aul;
		var dw = 0, dh = 0;
		if (AkihabaraGamebox._loaderqueue.isBusy() || (AkihabaraGamebox._minimalexpired !== 2)) {
			AkihabaraGamebox._screenCtx.save();
			AkihabaraGamebox.blitFade(AkihabaraGamebox._screenCtx, {alpha: 1});
			if (!AkihabaraGamebox._minimalexpired && AkihabaraGamebox._splashscreeniscompleted()) {
				AkihabaraGamebox._minimalexpired = 1;
				setTimeout(AkihabaraGamebox._minimaltimeexpired, AkihabaraGamebox._splash.minimalTime);
			}
			if (AkihabaraGamebox._splash.loading) { AkihabaraGamebox._splash.loading(AkihabaraGamebox._screenCtx, AkihabaraGamebox._loaderqueue.getDone(), AkihabaraGamebox._loaderqueue.getTotal()); }
			if (AkihabaraGamebox._flags.loadscreen === "c64") {
				var p = 0, l = 0;
				while (p !== AkihabaraGamebox.getScreenH()) {
					l = 10 + Math.floor(Math.random() * AkihabaraGamebox.getScreenH() / 4);
					if (p + l > AkihabaraGamebox.getScreenH()) { l = AkihabaraGamebox.getScreenH() - p; }
					AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox.PALETTES.c64.colors[AkihabaraGamebox.PALETTES.c64.order[Math.floor(Math.random() * AkihabaraGamebox.PALETTES.c64.order.length)]];
					AkihabaraGamebox._screenCtx.fillRect(0, p, AkihabaraGamebox.getScreenW(), l);
					p += l;
				}
				AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox.PALETTES.c64.colors.lightblue;
				AkihabaraGamebox._screenCtx.fillRect(Math.floor(AkihabaraGamebox.getScreenW() / 10), Math.floor(AkihabaraGamebox.getScreenH() / 10), AkihabaraGamebox.getScreenW() - Math.floor(AkihabaraGamebox.getScreenW() / 5), AkihabaraGamebox.getScreenH() - Math.floor(AkihabaraGamebox.getScreenH() / 5));
				if (AkihabaraGamebox._splash.minilogo && AkihabaraGamebox.imageIsLoaded("logo")) {
					dw = AkihabaraGamebox.getScreenW() / 4;
					dh = (AkihabaraGamebox.getImage("logo").height * dw) / AkihabaraGamebox.getImage("logo").width;
					AkihabaraGamebox.blit(AkihabaraGamebox._screenCtx, AkihabaraGamebox.getImage(AkihabaraGamebox._splash.minilogo), {w: AkihabaraGamebox.getImage("logo").width, h: AkihabaraGamebox.getImage("logo").height, dx: (AkihabaraGamebox.getScreenW() - dw) / 2, dy: (AkihabaraGamebox.getScreenH() - dh) / 2, dw: dw, dh: dh});
				}
			} else {
				if (AkihabaraGamebox._splash.background && AkihabaraGamebox.imageIsLoaded("_splash")) {
					AkihabaraGamebox.blit(AkihabaraGamebox._screenCtx, AkihabaraGamebox.getImage("_splash"), {w: AkihabaraGamebox.getImage("_splash").width, h: AkihabaraGamebox.getImage("_splash").height, dx: 0, dy: 0, dw: AkihabaraGamebox.getScreenW(), dh: AkihabaraGamebox.getScreenH()});
				}
				if (AkihabaraGamebox._splash.minilogo && AkihabaraGamebox.imageIsLoaded("logo")) {
					dw = AkihabaraGamebox.getScreenW() / 4;
					dh = (AkihabaraGamebox.getImage("logo").height * dw) / AkihabaraGamebox.getImage("logo").width;
					AkihabaraGamebox.blit(AkihabaraGamebox._screenCtx, AkihabaraGamebox.getImage(AkihabaraGamebox._splash.minilogo), {w: AkihabaraGamebox.getImage("logo").width, h: AkihabaraGamebox.getImage("logo").height, dx: AkihabaraGamebox.getScreenW() - dw - 5, dy: AkihabaraGamebox.getScreenH() - dh - 5, dw: dw, dh: dh});
				}
				if (AkihabaraGamebox._splash.footnotes && AkihabaraGamebox.imageIsLoaded("_dbf")) {
					if (!AkihabaraGamebox.getCanvas("_footnotes")) {
						var fd = AkihabaraGamebox.getFont("_dbf");
						AkihabaraGamebox.createCanvas("_footnotes", {w: AkihabaraGamebox.getScreenW() - 5, h: (AkihabaraGamebox._splash.footnotes.length) * (fd.tileh + AkihabaraGamebox._splash.footnotesSpacing)});
						for (var i = 0; i < AkihabaraGamebox._splash.footnotes.length; i++) {
							AkihabaraGamebox.blitText(AkihabaraGamebox.getCanvasContext("_footnotes"), {
								font: "_dbf",
								dx: 0,
								dy: i * (fd.tileh + AkihabaraGamebox._splash.footnotesSpacing),
								text: AkihabaraGamebox._splash.footnotes[i]
							});
						}
					}
					AkihabaraGamebox.blitAll(AkihabaraGamebox._screenCtx, AkihabaraGamebox.getCanvas("_footnotes"), {dx: 5, dy: AkihabaraGamebox.getScreenH() - AkihabaraGamebox.getCanvas("_footnotes").height - 5});
				}
				if (AkihabaraGamebox._loaderqueue.isBusy()) {
					var bw = Math.floor(((AkihabaraGamebox.getScreenW() - 4) * AkihabaraGamebox._loaderqueue.getDone()) / AkihabaraGamebox._loaderqueue.getTotal());
					AkihabaraGamebox._screenCtx.globalAlpha = 1;
					AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox._splash.gaugeBorderColor;
					AkihabaraGamebox._screenCtx.fillRect(0, Math.floor((AkihabaraGamebox.getScreenH() - AkihabaraGamebox._splash.gaugeHeight) / 2), AkihabaraGamebox.getScreenW(), AkihabaraGamebox._splash.gaugeHeight);
					AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox._splash.gaugeBackColor;
					AkihabaraGamebox._screenCtx.fillRect(1, Math.floor(((AkihabaraGamebox.getScreenH() - AkihabaraGamebox._splash.gaugeHeight) / 2) + 1), AkihabaraGamebox.getScreenW() - 4, AkihabaraGamebox._splash.gaugeHeight - 2);
					AkihabaraGamebox._screenCtx.fillStyle = AkihabaraGamebox._splash.gaugeColor;
					AkihabaraGamebox._screenCtx.fillRect(1, Math.floor(((AkihabaraGamebox.getScreenH() - AkihabaraGamebox._splash.gaugeHeight) / 2) + 1), (bw > 0 ? bw : 0), AkihabaraGamebox._splash.gaugeHeight - 2);
				}
			}
			AkihabaraGamebox._screenCtx.restore();
			if (typeof AkihabaraDebug !== "undefined") { AkihabaraDebug.setStatBar("Loading... (" + AkihabaraGamebox._loaderqueue.getDone() + "/" + AkihabaraGamebox._loaderqueue.getTotal() + ")"); }
			setTimeout(AkihabaraGamebox._waitforloaded, 50);
		} else {
			AkihabaraGamebox.deleteImage("_splash");
			if (typeof AkihabaraDebug !== "undefined") { AkihabaraDebug.setStatBar(); }
			AkihabaraGamebox._cb();
		}
	},
	clearCache: function () { this._loadercache.clear(); },

	// ---
	// ---
	// ---  BROWSER QUIRKS
	// ---
	// ---

	checkCanvasSupport: function () {
		return !!document.createElement('canvas').getContext;
	},
	addEventListener: function (to, event, code) {
		if (to.addEventListener) {
			to.addEventListener(event, code, false);
		} else {
			to.attachEvent('on' + event, code);
		}
	},
	removeEventListener: function (to, event, code) {
		if (to.removeEventListener) {
			to.removeEventListener(event, code, false);
		} else {
			to.detachEvent('on' + event, code);
		}
	},
	XMLHttpFactories: [
		function () {return new XMLHttpRequest(); },
		function () {return new ActiveXObject("Msxml2.XMLHTTP"); },
		function () {return new ActiveXObject("Msxml3.XMLHTTP"); },
		function () {return new ActiveXObject("Microsoft.XMLHTTP"); }
	],
	createXmlHttpRequest: function () {
		var xmlhttp = false;
		/* running locally on IE5.5, IE6, IE7 */
		/*@cc_on
		if (location.protocol == "file: ") {
			if (!xmlhttp)try{ xmlhttp = new ActiveXObject("MSXML2.XMLHTTP"); }catch(e) { xmlhttp = false; }
			if (!xmlhttp)try{ xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }catch(e) { xmlhttp = false; }
		}                                                                                ; @cc_off @*/

		/* IE7, Firefox, Safari, Opera...  */
		if (!xmlhttp) { try { xmlhttp = new XMLHttpRequest(); } catch (e) { xmlhttp = false; } }

		/* IE6 */
		if (typeof ActiveXObject !== "undefined") {
			if (!xmlhttp) { try { xmlhttp = new ActiveXObject("MSXML2.XMLHTTP"); } catch (e) { xmlhttp = false; } }
			if (!xmlhttp) { try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) { xmlhttp = false; } }
		}

		/* IceBrowser */
		if (!xmlhttp) { try { xmlhttp = createRequest(); } catch (e) { xmlhttp = false; } }
		return xmlhttp;
	}
};
