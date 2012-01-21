/**
 * Keyboard and other input handling
 * @namespace AkihabaraKeyboard
 */
var input = {
	//
	// Keyboard
	//
	_keyboard: [],
	_keyboardpicker: 0,
	_keymap: {
		up: 38,
		down: 40,
		right: 39,
		left: 37,
		a: 90,
		b: 88,
		c: 67,
		pause: 80, //p
		mute: 77 //m
	},
	_keydown: function(e){
		if (e.preventDefault) e.preventDefault();
		var key = (e.fake || window.event?e.keyCode: e.which);
		if (!input._keyboard[key]) input._keyboard[key] = 1;
	},
	_keyup: function(e){
		if (e.preventDefault) e.preventDefault();
		var key = (e.fake || window.event?e.keyCode: e.which);
		input._keyboard[key] = -1;
		//Check for global action keys
		if( e.keyCode === input._keymap.pause ) gbox.pauseGame();
		if( e.keyCode === input._keymap.mute ){
			if( !AkihabaraAudio._totalAudioMute ){
				AkihabaraAudio.totalAudioMute();
				AkihabaraAudio._totalAudioMute = true;
			}else{
				AkihabaraAudio.totalAudioUnmute();
				AkihabaraAudio._totalAudioMute = false;
			}
		}
	},
	_resetkeys: function() {
		for (var key in input._keymap)
			input._keyup({fake: 1, keyCode: input._keymap[key]});
	},
	_showkeyboardpicker: function(th){
		input._keyboardpicker.value = "Click/Tap here to enable the keyboard";
		input._keyboardpicker.style.left = (gbox._screenposition.x + 5) + "px";
		input._keyboardpicker.style.top = (gbox._screenposition.y + 5) + "px";
		input._keyboardpicker.style.width = (gbox._screenposition.w-10) + "px";
		input._keyboardpicker.style.height = "30px";
		input._keyboardpicker.style.border = "1px dashed white";
		input._keyboardpicker.readOnly = null;
	},
	_hidekeyboardpicker: function(th){
		input._keyboardpicker.style.zIndex = 100;
		input._keyboardpicker.readOnly = "yes";
		input._keyboardpicker.style.position = "absolute";
		input._keyboardpicker.style.textAlign = "center";
		input._keyboardpicker.style.backgroundColor = "#000000";
		input._keyboardpicker.style.color = "#fefefe";
		input._keyboardpicker.style.cursor = "pointer";
		input._keyboardpicker.value = "";
		input._keyboardpicker.style.left = "0px";
		input._keyboardpicker.style.top = "0px";
		input._keyboardpicker.style.height = "0px";
		input._keyboardpicker.style.width = "0px";
		input._keyboardpicker.style.border = "0px";
		input._keyboardpicker.style.padding = "0px";
		input._keyboardpicker.style.margin = "0px";
	},

	/**
	* Returns true if a given key in this._keymap is pressed. Only returns true on the transition from unpressed to pressed.
	* @param {String} id A key in the keymap. By default, one of: "up" "down" "left" "right" "a" "b" "c"
	* @returns {Boolean} True if the given key is transitioning from unpressed to pressed in this frame.
	*/
	keyIsHit: function(id) { return this._keyboard[this._keymap[id]] == 1; },

	/**
	* Returns true if a given key in this._keymap is being held down. Returns true as long as the key is held down.
	* @param {String} id A key in the keymap. By default, one of: "up" "down" "left" "right" "a" "b" "c"
	* @returns {Boolean} True if the given key is held down.
	*/
	keyIsPressed: function(id) { return this._keyboard[this._keymap[id]] > 0; },

	/**
	* Returns true if a given key in this._keymap has been held down for at least one frame. Will not return true if a key
	* is quickly tapped, only once it has been held down for a frame.
	* @param {String} id A key in the keymap. By default, one of: "up" "down" "left" "right" "a" "b" "c"
	* @returns {Boolean} True if the given key has been held down for at least one frame.
	*/
	keyIsHold: function(id) { return this._keyboard[this._keymap[id]] > 1; },

	/**
	* Returns true if a given key in this._keymap is released. Only returns true on the transition from pressed to unpressed.
	* @param {String} id A key in the keymap. By default, one of: "up" "down" "left" "right" "a" "b" "c"
	* @returns {Boolean} True if the given key is transitioning from pressed to unpressed in this frame.
	*/
	keyIsReleased: function(id) { return this._keyboard[this._keymap[id]] == -1; },

	addKeyListernerTo: function(th) {
		th.addEventListener(window, 'keydown', input._keydown);
		th.addEventListener(window, 'keyup', input._keyup);
	},

	// Keyboard support on devices that needs focus (like iPad) - actually is not working for a bug on WebKit's "focus" command.
	focusDrivenKeyboardSuport: function(th) {
		input._keyboardpicker = document.createElement("input");
		input._keyboardpicker.onclick = function(evt) { input._hidekeyboardpicker(); evt.preventDefault(); evt.stopPropagation(); };
		input._hidekeyboardpicker(input._keyboardpicker);
		th._box.appendChild(input._keyboardpicker);
	},

	//
	// Touch
	//
	addTouchEventsTo: function(th){
		th.ontouchstart = function(evt) { gbox._screenposition = gbox._domgetabsposition(gbox._screen); if (evt.touches[0].pageY-gbox._screenposition.y < 30) input._showkeyboardpicker(gbox); else input._hidekeyboardpicker(gbox); evt.preventDefault(); evt.stopPropagation(); };
		th.ontouchend = function(evt) { evt.preventDefault(); evt.stopPropagation(); };
		th.ontouchmove = function(evt) { evt.preventDefault(); evt.stopPropagation(); };
		th.onmousedown = function(evt) { gbox._screenposition = gbox._domgetabsposition(gbox._screen); if (evt.pageY-gbox._screenposition.y < 30) input._showkeyboardpicker(gbox); else input._hidekeyboardpicker(gbox); evt.preventDefault(); evt.stopPropagation(); };
	}
};
