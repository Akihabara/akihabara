describe("AkihabaraDevices", function () {
	it("should apply the default desktop capability to an object", function () {
		var obj = {};
		AkihabaraDevices.defaultDesktopCapability(obj);
		expect(obj.zoom).toEqual(2);
	});

	it("should apply the default mobile capability to an object", function () {
		var obj = {};
		AkihabaraDevices.defaultMobileCapability(obj);
		expect(obj.touch).toEqual(true);
		expect(obj.width).toEqual(320);
	});

	it("should set the configuration for wii", function () {
		var obj = {};
		obj = AkihabaraDevices.configurationFor("nintendo wii");
		expect(obj.iswii).toEqual(true);
	});

	it("should apply the konqueror capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.konqueror(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audioissinglechannel).toEqual(true);
		expect(capabilities.audiocompatmode).toEqual(2);
		expect(capabilities.forcedmimeaudio).toEqual("audio/ogg");
		expect(capabilities.audioisexperimental).toEqual(true);
	});

	it("should apply the safari capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.safari(capabilities);
		expect(capabilities.audioteam).toEqual(1);
	});

	it("should apply the opera capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.opera(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audiocreatemode).toEqual(1);
	});

	it("should apply the IE9 capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.ie9(capabilities);
		expect(capabilities.audioteam).toEqual(2);
		expect(capabilities.audiocompatmode).toEqual(1);
	});

	it("should apply the IE7 capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.ie7(capabilities);
		expect(capabilities.audioteam).toEqual(2);
		expect(capabilities.audiocompatmode).toEqual(1);
		expect(capabilities.audioisexperimental).toEqual(true);
	});

	it("should apply the firefox capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.firefox(capabilities);
		expect(capabilities.audioteam).toEqual(1);
	});

	it("should apply the chrome capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.chrome(capabilities);
		expect(capabilities.audioteam).toEqual(3);
	});

	it("should apply the android capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.android(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audiocompatmode).toEqual(2);
		expect(capabilities.audioisexperimental).toEqual(true);
		expect(capabilities.audioissinglechannel).toEqual(true);
	});

	it("should apply the iphone capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.iphone(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audiocompatmode).toEqual(2);
		expect(capabilities.audioisexperimental).toEqual(true);
		expect(capabilities.audioissinglechannel).toEqual(true);
	});

	it("should apply the ipod capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.ipod(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audiocompatmode).toEqual(2);
		expect(capabilities.audioisexperimental).toEqual(true);
		expect(capabilities.audioissinglechannel).toEqual(true);
	});

	it("should apply the ipad capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.ipad(capabilities);
		expect(capabilities.audioteam).toEqual(1);
		expect(capabilities.audiocompatmode).toEqual(2);
		expect(capabilities.audioisexperimental).toEqual(true);
		expect(capabilities.audioissinglechannel).toEqual(true);
	});

	it("should apply the nintendo wii capabilities to an object", function () {
		var capabilities = {};
		AkihabaraDevices.nintendo_wii(capabilities);
		expect(capabilities.doublebuffering).toEqual(true);
	});
});
