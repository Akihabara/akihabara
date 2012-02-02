/**
 * The main purpose of this module is to provide functions to integrate
 * all akibahara modules easily.
 * @namespace Akihabara
 */
var Akihabara = {
	/**
	* Akihabara current version
	* @type String
	**/
	VERSION: "2.0.0",

	/**
	* Extends form a module using custom data. This function merges data to the model, and if data and model share parameters, data's values remain intact.
	* @param {Object} model An object containing a set of parameters, a.k.a the source.
	* @param {Object} data An object containing a set of parameters, to merge with the source module.
	* @returns A merged model where the values of 'data' remain untouched: only new parameters and values from 'model' make it in.
	*
	* @example
	* AkihabaraTopview = {a: 1, b: 2, c: "three"};
	* withNewFunctions = {c: 3, d: "four"};
	*
	* newTopview = Akihabara.extendsFrom(AkihabaraTopview, withNewFunctions);
	* newTopview; // => {a: 1, b: 2, c: 3, d: "four"};
	**/
	extendsFrom: function (model, data) {
		if (data == null) { data = {}; }
		if (model != null) {
			for (var i in model) {
				if (data[i] == null) { data[i] = model[i]; }
			}
		}
		return data;
	},

	/**
	* This provides a number of configurations: fps, display zoom, dynamic frameskip, force touch parameters, etc. <br/>
	* Many of these settings can be set manually by passing an object with the parameters defined.
	* This function calls AkihabaraDebug.applyURLParametersOn to apply the url parameters to the game object.
	*
	* @param {Object} data An optional object containing parameters you wish to set. Works for:
	* <ul>
	* <li>data.zoom
	* <li>data.splash
	* <li>data.width
	* <li>data.height
	* <li>data.title
	* <li>data.fps
	* <li>data.padmode
	* </ul>
	*/
	createNewGame: function (data) {
		if ((typeof data).toLowerCase() === "string") { data = {title: data}; }
		var device = AkihabaraDevices.configurationFor(navigator.userAgent);
		var footnotes = ["MADE WITH AKIHABARA (C)2012 - GPL2/MIT", "Project: http://akihabara.github.com", "Sources: http://github.com/akihabara"];
		document.title = (data.title ? data.title : "Akihabara");
		if (data.splash) {
			if (data.splash.footnotes) {
				for (var i = 0; i < footnotes.length; i++) {
					data.splash.footnotes.push(footnotes[i]);
				}
			}
			AkihabaraGamebox.setSplashSettings(data.splash);
		}
		var screenwidth = (data.width ? data.width : (data.portrait ? 240 : 320));
		var screenheight = (data.height ? data.height : (data.portrait ? 320 : 240));
		if (device.iswii) {
			AkihabaraInput._keymap = {
				left: 175,
				right: 176,
				up: 177,
				down: 178,
				a: 173,
				b: 172,
				c: 13
			};
			document.onkeypress = function (e) {
				if (e.preventDefault) {
					e.preventDefault();
					return false;
				}
			};
		}

		if (typeof data.basepath === 'string') {
			AkihabaraGamebox.setBasePath(data.basepath);
		}
		if (data.debugfont) { AkihabaraGamebox.setDebugFont(data.debugfont); }
		if (data.offlinecache) { AkihabaraGamebox.setOfflineCache(data.offlinecache); }
		if (!data.splash || (data.splash.minilogo == null)) { AkihabaraGamebox.setSplashSettings({minilogo: "logo"}); }
		if (!data.splash || (data.splash.background == null)) { AkihabaraGamebox.setSplashSettings({background: AkihabaraGamebox._basepath + "splash.png"}); }
		if (!data.splash || (data.splash.minimalTime == null)) { AkihabaraGamebox.setSplashSettings({minimalTime: 3000}); }
		if (!data.splash || (data.splash.footnotes == null)) { AkihabaraGamebox.setSplashSettings({footnotes: footnotes}); }
		if (!data || !data.hardwareonly) {
			document.body.style.backgroundColor = "#000000";
			AkihabaraGamebox.setScreenBorder(false);
		}
		if (data.backgroundColor) { document.body.style.backgroundColor = data.backgroundColor; }

		// Test and apply parameters passed in the URL
		if (AkihabaraDebug) { AkihabaraDebug.applyURLParametersOn(device); }

		if (data.zoom) {
			AkihabaraGamebox.setZoom(data.zoom);
		} else if (device.zoom) {
			AkihabaraGamebox.setZoom(device.zoom);
		} else if (device.width) {
			AkihabaraGamebox.setZoom(device.width / screenwidth);
		} else if (device.height) {
			AkihabaraGamebox.setZoom(device.height / screenheight);
		}

		AkihabaraGamebox.setFps((data.fps ? data.fps : 25));

		if (device.forcedidle) { AkihabaraGamebox.setForcedIdle(device.forcedidle); }

		if (!data || !data.hardwareonly) { AkihabaraGamebox.initScreen(screenwidth, screenheight); }

		AkihabaraAudio.setCanAudio(device.canaudio && (!device.audioisexperimental || AkihabaraGamebox.getFlag("experimental")));

		if (device.audiocompatmode) {
			AkihabaraAudio.setAudioCompatMode(device.audiocompatmode);
		}

		if (device.audioteam) {
			AkihabaraAudio.setAudioTeam(device.audioteam);
		}

		if (device.loweraudioteam) {
			AkihabaraAudio.setLowerAudioTeam(device.loweraudioteam);
		}

		if (device.audiocreatemode) {
			AkihabaraAudio.setAudioCreateMode(device.audiocreatemode);
		}

		if (device.audiodequeuetime) {
			AkihabaraAudio.setAudioDequeueTime(device.audiodequeuetime);
		}

		if (device.audiopositiondelay) {
			AkihabaraAudio.setAudioPositionDelay(device.audiopositiondelay);
		}

		if (device.forcedmimeaudio) {
			AkihabaraAudio.setForcedMimeAudio(device.forcedmimeaudio);
		}

		if (device.audioissinglechannel) {
			AkihabaraAudio.setAudioIsSingleChannel(device.audioissinglechannel);
		}

		if (!data || !data.hardwareonly) {
			if (AkihabaraDebug.getURLValueFor("touch") !== "no" && (AkihabaraDebug.getURLValueFor("touch") === "yes" || device.touch)) {
				switch (data.padmode) {
				case "fretboard":
					AkihabaraIphofretboard.initialize({h: 100, bg: AkihabaraGamebox._basepath + "fretboard.png"});
					break;
				case "none":
					break;
				default:
					AkihabaraIphopad.initialize({h: 100, dpad: AkihabaraGamebox._basepath + "dpad.png", buttons: AkihabaraGamebox._basepath + "buttons.png", bg: AkihabaraGamebox._basepath + "padbg.png"});
					break;
				}
			}
		}

		return device;
	}
};
