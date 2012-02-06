describe("AkihabaraGamebox", function () {
	it("should determine the correct animation frame to display", function () {
		var anim = {speed: 1, frames: [1]};
		expect(AkihabaraGamebox.decideFrame(1, anim)).toEqual(1);
	});

	it("should determine the correct animation frame to display for 2 frames with the count with the value of 2", function () {
		var anim = {speed: 1, frames: [1, 2]};
		expect(AkihabaraGamebox.decideFrameOnce(2, anim)).toEqual(2);
	});

	it("should determine the correct animation frame to display when the count is higher than the number of frames", function () {
		var anim = {speed: 1, frames: [1, 2]};
		expect(AkihabaraGamebox.decideFrameOnce(3, anim)).toEqual(2);
	});

	it("should return true when the count number is the same of the frames number", function () {
		var anim = {speed: 1, frames: [1]};
		expect(AkihabaraGamebox.isLastFrameOnce(1, anim)).toEqual(true);
	});

	it("should return true when the count number higher than frames number", function () {
		var anim = {speed: 1, frames: [1]};
		expect(AkihabaraGamebox.isLastFrameOnce(5, anim)).toEqual(true);
	});
});
