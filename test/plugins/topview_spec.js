describe("AkihabaraTopview", function () {
	it("should return true if the object is jumped on", function () {
		var th = {y: 9, h: 9}; // on the ground
		var by = {
			y: 5, // in the air
			h: 4, // height < position
			accy: 1 // falling
		}; // in the air
		spyOn(AkihabaraGamebox, "collides").andReturn(true);
		expect(AkihabaraPlatformer.isSquished(th, by)).toEqual(true);
	});

	it("should return false if the object is not jumped on", function () {
		var th = {y: 9, h: 9}; // on the ground
		var by = {
			y: 105, // in the air far away
			h: 4,
			accy: 1 // falling
		}; // in the air
		spyOn(AkihabaraGamebox, "collides").andReturn(true);
		expect(AkihabaraPlatformer.isSquished(th, by)).toEqual(false);
	});
});
