describe("AkihabaraDebug", function () {
	it("should return an object as string", function () {
		var obj = {pothix: "working"};
		expect(AkihabaraDebug.objToStr(obj)).toEqual("pothix:[working] ");
	});

	it("should get the value of an url parameter", function () {
		spyOn(AkihabaraDebug, "getURL").andReturn("http://example.com/game.html?lives=3");
		expect(AkihabaraDebug.getURLValueFor("lives")).toEqual("3");
	});

	it("should convert 25 frames to 1 second assuming 25 FPS", function () {
		spyOn(AkihabaraGamebox, "getFps").andReturn(25);
		expect(AkihabaraDebug.framesToTime(25)).toEqual("00:01:00");
	});

	it("should convert 25*60 frames to 1 minute assuming 25 FPS", function () {
		spyOn(AkihabaraGamebox, "getFps").andReturn(25);
		expect(AkihabaraDebug.framesToTime(25 * 60)).toEqual("01:00:00");
	});
});
