describe("AkihabaraDebug", function () {
	it("Should get the value of an url parameter", function () {
		spyOn(AkihabaraDebug, "getURL").andReturn("http://example.com/game.html?lives=3");
		expect(AkihabaraDebug.getURLValueFor("lives")).toEqual("3");
	});
});
