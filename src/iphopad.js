/**
 * Iphopad module provides a touchpad for touch-based device (for now, Android and iDevices).
 * @namespace AkihabaraIphopad
 */
var AkihabaraIphopad = {

	_buttonsize: 50,
	_buttonsize2: 100,
	_buttonsize3: 150,
	_gapx: 0,
	_gapy: 0,
	_width: 0,
	_height: 0,
	_center: {},
	_cross: {up: false, down: false, left: false, right: false},
	_buttons: {a: false, b: false, c: false},
	_transl: (Math.PI * 0.125),
	_brad: (Math.PI * 0.25),
	_swap: false,
	_positions: [
		{up: false, down: false, left: false, right: true},
		{up: false, down: true, left: false, right: true},
		{up: false, down: true, left: false, right: false},
		{up: false, down: true, left: true, right: false},
		{up: false, down: false, left: true, right: false},
		{up: true, down: false, left: true, right: false},
		{up: true, down: false, left: false, right: false},
		{up: true, down: false, left: false, right: true}
	],

	_listen: function (e) {
		var i;
		var nc = {up: false, down: false, left: false, right: false};
		var nb = {a: false, b: false, c: false};
		for (i = 0; i < e.touches.length; i++) {
			var rp = {x: e.touches[i].pageX - AkihabaraIphopad._gapx, y: e.touches[i].pageY - AkihabaraIphopad._gapy};
			if (rp.x < AkihabaraIphopad._height) {
				nc = AkihabaraIphopad._positions[Math.floor(AkihabaraTrigo.getAngle(AkihabaraIphopad._center, rp, AkihabaraIphopad._transl) / AkihabaraIphopad._brad)];
			} else {
				if (rp.x > AkihabaraIphopad._width - AkihabaraIphopad._buttonsize) {
					nb.a = true;
				} else {
					if (rp.x > AkihabaraIphopad._width - AkihabaraIphopad._buttonsize2) {
						nb.b = true;
					} else {
						if (rp.x > AkihabaraIphopad._width - AkihabaraIphopad._buttonsize3) { nb.c = true; }
					}
				}
			}
		}

		this._swap = !this._swap;
		for (i in this._cross) {
			// Using true or 1? Using triple equals for now. Need to check.
			if (nc[i] !== AkihabaraIphopad._cross[i]) {
				if (nc[i]) {
					AkihabaraInput._keydown({fake: true, keyCode: AkihabaraInput._keymap[i]});
				} else {
					AkihabaraInput._keyup({fake: true, keyCode: AkihabaraInput._keymap[i]});
				}
			}
		}
		for (i in this._buttons) {
			// Using true or 1? Using triple equals for now. Need to check.
			if (nb[i] !== AkihabaraIphopad._buttons[i]) {
				if (nb[i]) {
					AkihabaraInput._keydown({fake: true, keyCode: AkihabaraInput._keymap[i]});
				} else {
					AkihabaraInput._keyup({fake: true, keyCode: AkihabaraInput._keymap[i]});
				}
			}
		}

		AkihabaraIphopad._cross = nc;
		AkihabaraIphopad._buttons = nb;
	},

	_fakelisten: function (e) {
		AkihabaraIphopad._listen({
			touches: [
				{
					pageX: e.clientX,
					pageY: e.clientY
				}
			]
		});
	},

	/**
	* Initializes the game controls for use with an I-product or Android device.
	* @param {Object} data passes in information about the screen and its traits such as size.
	*/
	initialize: function (data) {
		var oElement = document.createElement("div");
		oElement.style.margin = "auto";
		oElement.style.padding = "0px";
		oElement.style.height = data.h + "px";
		oElement.style.width = "100%";
		oElement.style.backgroundImage = "url(" + data.bg + ")";
		oElement.style.backgroundRepeat = "repeat-x";

		var tpad = document.createElement("div");
		tpad.style.cssFloat = "left";
		tpad.style.padding = "0px";
		tpad.style.margin = "0px";
		tpad.style.height = data.h + "px";
		tpad.style.width = data.h + "px";
		tpad.style.backgroundImage = "url(" + data.dpad + ")";
		tpad.style.backgroundRepeat = "no-repeat";

		var bpad = document.createElement("div");
		bpad.style.cssFloat = "right";
		bpad.style.padding = "0px";
		bpad.style.margin = "0px";
		bpad.style.height = data.h + "px";
		bpad.style.width = AkihabaraIphopad._buttonsize3 + "px";
		bpad.style.backgroundImage = "url(" + data.buttons + ")";
		bpad.style.backgroundRepeat = "no-repeat";

		oElement.appendChild(tpad);
		oElement.appendChild(bpad);
		AkihabaraGamebox._box.appendChild(oElement);

		oElement.ontouchstart = function (evt) { evt.preventDefault(); evt.stopPropagation(); AkihabaraIphopad._listen(evt); };
		oElement.ontouchend = function (evt) { evt.preventDefault(); evt.stopPropagation(); AkihabaraIphopad._listen(evt); };
		oElement.ontouchmove = function (evt) { evt.preventDefault(); evt.stopPropagation(); AkihabaraIphopad._listen(evt); };
		var sizes = AkihabaraGamebox._domgetabsposition(oElement);
		this._gapx = sizes.x;
		this._gapy = sizes.y;
		this._width = sizes.w;
		this._height = sizes.h;
		this._center = {x: Math.floor(this._height / 2), y: Math.floor(this._height / 2)};
	}
};
