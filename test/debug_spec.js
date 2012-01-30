describe("AkihabaraDebug", function () {
	it("should return an object as string", function () {
		var obj = {pothix: "working"};
		expect(AkihabaraDebug.objToStr(obj)).toEqual("pothix:[working] ");
	});

	it("should get the value of an url parameter", function () {
		spyOn(AkihabaraDebug, "getURL").andReturn("http://example.com/game.html?lives=3");
		expect(AkihabaraDebug.getURLValueFor("lives")).toEqual("3");
	});
});
