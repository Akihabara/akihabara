// ---
// Copyright (c) 2011 EtnasSoft, http://www.etnassoft.com/
// ---

/**
 * @namespace Debug module provides some utils for debug the Akihabara user project.
 */
var debug = {

	fpsCounterInit : function(data) {

		// Default assigments
		data 						|| ( data = {} );
		data.x 					|| ( data.x = 0 );
		data.y 					|| ( data.y = 0 );
		data.font 			|| ( data.font = 'lighter 10px sans-serif' );
		data.color 			|| ( data.color = "#FFF" );

		// Own fpsCounter vars
		data.frameCount = 0,
		data.currentFps = 0,
		data.lastFps = new Date().getTime();

		// Setting data to main object game
		addDebugAction('fpsCounter', data);

		// Add a new debig utility and its data
		function addDebugAction( name, data ){
			gbox._debugTool[name] = data;
		}

	},

	run : function(data){

		if(data.fpsCounter){

			var fps = data.fpsCounter,
					thisFrame = new Date().getTime(),
					diffTime = Math.ceil((thisFrame - fps.lastFps)),
					ctx = gbox._screenCtx;

			if (diffTime >= 1000) {
				fps.currentFps = fps.frameCount;
				fps.frameCount = 0.0;
				fps.lastFps = thisFrame;
			}

			fps.frameCount++;

			// Print the result on the main CTX
			ctx.fillStyle = fps.color;
			ctx.font = fps.font;
			ctx.fillText( 'FPS: ' + fps.currentFps + '/' + gbox._fps, fps.x, fps.y );

		}

	}

};