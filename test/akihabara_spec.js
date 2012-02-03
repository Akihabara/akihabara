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

	it("should receive a new object with the same properties than the old one", function () {
		var obj = {a: 1, b: 2, c: "three"};
		expect(Akihabara.copyModel(obj)).toEqual(obj);
	});

	it("should receive a new object with the same properties than the old one", function () {
		var obj = {a: 1, b: 2, c: "three"};
		var copy = {a: 2, b: 3, c: "four"};
		expect(Akihabara.cloneObject(obj, copy)).toEqual(obj);
	});

	it("should create a new model with custom params based on a given one", function () {
		var obj = {a: 1, b: 2, c: "three"};
		expect(
			Akihabara.createModel(obj, ["a", "c"])
		).toEqual({a: 1, c: "three"});
	});
});
