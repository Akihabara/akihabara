/**
* A simple namespace to provide a better code interface
*
* This is just an experiment for now
* @namespace
**/
var AkihabaraInterface = {
	Audio: AkihabaraAudio,
	Gamecycle: AkihabaraGamecycle,
	Help: AkihabaraHelp,
	Input: AkihabaraInput,
	Tools: AkihabaraTools,
	Toys: AkihabaraToys,

	plugins: {
		"Topview": AkihabaraTopview,
		"Platformer": AkihabaraPlatformer,
		"Shmup": AkihabaraShmup
	}
};
