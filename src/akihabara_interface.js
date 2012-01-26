/**
* A simple namespace to provide a better code interface
*
* This is just an experiment for now
* @namespace
**/
var AkihabaraInterface = {
	Audio: AkihabaraAudio,
	Input: AkihabaraInput,
	Gamecycle: gamecycle,
	plugins: {
		"Topview": topview,
		"Platformer": platformer,
		"Shmup": shmup
	}
};
