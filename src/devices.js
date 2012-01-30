/**
 * Configure Akihabara based on the current device browser
 * @namespace AkihabaraDevices
 */
var AkihabaraDevices = {
	/**
	* Apply desktop capabilities to a given object
	* @param {Object} cap The object containing the capabilities
	**/
	defaultDesktopCapability: function (cap) {
		cap.zoom = 2;
	},

	/**
	* Apply mobile capabilities to a given object
	* @param {Object} cap The object containing the capabilities
	**/
	defaultMobileCapability: function (cap) {
		cap.touch = true;
		cap.width = 320;
	},

	/**
	* Apply the configurations for a given browser
	* @param {Object} agent The browser userAgent
	* @returns {Object} cap The capabilities for the current browser
	**/
	configurationFor: function (agent) {
		var cap = {};

		switch (agent.match(/Android|Chrome|Firefox|iPhone|iPad|konqueror|Minefield|nintendo wii|Opera|MSIE 9\.0|MSIE 7\.0/i)[0]) {
		case "Android":
			AkihabaraDevices.android(cap);
			break;
		case "Chrome":
			AkihabaraDevices.chrome(cap);
			break;
		case "iPhone":
			AkihabaraDevices.iphone(cap);
			break;
		case "iPad":
			AkihabaraDevices.ipad(cap);
			break;
		case "iPod":
			AkihabaraDevices.ipod(cap);
			break;
		case "konqueror":
			AkihabaraDevices.konqueror(cap);
			break;
		case "Minefield":
			// Using firefox configurations for Minefield
			AkihabaraDevices.firefox(cap);
			break;
		case "nintendo wii":
			AkihabaraDevices.nintendo_wii(cap);
			break;
		default:
			cap.zoom = 2;
			cap.audioisexperimental = true; // Audio is just experimental on all other devices.
		}

		return cap;
	},

	/**
	* Get the capabilities for Konqueror
	* @param {Object} cap Default capabilities to work with
	**/
	konqueror: function (cap) {
		cap.audioteam = 1;
		cap.audioissinglechannel = true; // Single channeled.  Plays only the "bgmusic" channel.
		cap.audiocompatmode = 2; // Sorry. Single channel mode. Audio events are not triggered properly and audio properties are missing so many audio features are not available. :(
		cap.forcedmimeaudio = "audio/ogg"; // Usually OGG audio playback is supported by default in KDE env.
		cap.audioisexperimental = true; // Audio is experimental, since limited.
	},

	/**
	* Get the capabilities for Safari
	* @param {Object} cap Default capabilities to work with
	**/
	safari: function (cap) {
		cap.audioteam = 1; // Testing smaller audioteam
	},

	/**
	* Get the capabilities for Opera
	* @param {Object} cap Default capabilities to work with
	**/
	opera: function (cap) {
		cap.audioteam = 1; // Testing smaller audioteam
		cap.audiocreatemode = 1; // Do not like audio object cloning very much
	},

	/**
	* Get the capabilities for IE9
	* @param {Object} cap Default capabilities to work with
	**/
	ie9: function (cap) {
		cap.audioteam = 2;
		cap.audiocompatmode = 1; // Audio loading mode.
	},

	/**
	* Get the capabilities for IE7
	* @param {Object} cap Default capabilities to work with
	**/
	ie7: function (cap) {
		cap.audioteam = 2;
		cap.audiocompatmode = 1; // Audio loading mode.
		cap.audioisexperimental = true;
	},

	/**
	* Get the capabilities for Firefox
	* @param {Object} cap Default capabilities to work with
	**/
	firefox: function (cap) {
		cap.audioteam = 1; // Testing smaller audioteam
	},

	/**
	* Get the capabilities for Chrome
	* @param {Object} cap Default capabilities to work with
	**/
	chrome: function (cap) {
		cap.audioteam = 3; // Quite low performance on playback responsiveness.
	},

	/**
	* Get the capabilities for Android
	* @param {Object} cap Default capabilities to work with
	**/
	android: function (cap) {
		AkihabaraDevices.defaultMobileCapability(cap);
		cap.audiocompatmode = 2; // Audio loading mode.
		cap.audioteam = 1; // Only a member is required in the audioteam.
		cap.audioisexperimental = true; // Audio is experimental, since limited.
		cap.audioissinglechannel = true; // Single channeled.  Plays only the "bgmusic" channel.
	},

	/**
	* Get the capabilities for iPhone
	* @param {Object} cap Default capabilities to work with
	**/
	iphone: function (cap) {
		AkihabaraDevices.defaultMobileCapability(cap);
		cap.audiocompatmode = 2; // Audio loading mode.
		cap.audioteam = 1; // Only a member is required in the audioteam.
		cap.audioisexperimental = true; // Audio is experimental, since limited.
		cap.audioissinglechannel = true; // Single channeled.  Plays only the "bgmusic" channel.
	},

	/**
	* Get the capabilities for iPod
	* @param {Object} cap Default capabilities to work with
	**/
	ipod: function (cap) {
		AkihabaraDevices.defaultMobileCapability(cap);
		cap.audiocompatmode = 2; // Audio loading mode.
		cap.audioteam = 1; // Only a member is required in the audioteam.
		cap.audioisexperimental = true; // Audio is experimental, since limited.
		cap.audioissinglechannel = true; // Single channeled.  Plays only the "bgmusic" channel.
	},

	/**
	* Get the capabilities for iPad
	* @param {Object} cap Default capabilities to work with
	**/
	ipad: function (cap) {
		cap.audiocompatmode = 2; // Audio loading mode.
		cap.audioteam = 1; // Only a member is required in the audioteam.
		cap.audioisexperimental = true; // Audio is experimental, since limited.
		cap.audioissinglechannel = true; // Single channeled.  Plays only the "bgmusic" channel.
	},

	/**
	* Get the capabilities for Nintendo wii
	* @param {Object} cap Default capabilities to work with
	**/
	nintendo_wii: function (cap) {
		/**
		* Simulated double buffering has been resumed.
		*  Canvas on Opera for Wii has a strange sprite blinking effect
		* usually browsers render frames once ended and this is an exception.
		**/
		cap.iswii = true;
		cap.height = window.innerHeight;
		cap.doublebuffering = true;
	}
};
