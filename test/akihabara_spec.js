describe("Akihabara", function () {
	it("should have the major 2 version", function () {
		expect(Akihabara.VERSION).toEqual("2.0.0");
	});

	it("should extend from a module", function () {
		var AkihabaraTopview = {a: 1, b: 2, c: "three"};
		var withNewFunctions = {c: 3, d: "four"};
		var newTopview = Akihabara.extendsFrom(AkihabaraTopview, withNewFunctions);

		expect(newTopview).toEqual({a: 1, b: 2, c: 3, d: "four"});
	});
});
