/**
 * Debug module provides some utils for debug the Akihabara user project.
 * @namespace AkihabaraDebug
 */
var debug = {

	fpsCounterInit: function (data) {

		// Default options
		data 						|| ( data 				= {} );
		data.x 					|| ( data.x 			= 0 );
		data.y 					|| ( data.y 			= 0 );
		data.font 			|| ( data.font 		= 'lighter 10px sans-serif' );
		data.color 			|| ( data.color 	= "#FFF" );

		// Own fpsCounter vars
		data.frameCount 	= 0,
		data.currentFps 	= 0,
		data.lastFps 			= new Date().getTime();

		// Setting data to main object game
		this.addDebugAction('fpsCounter', data);
	},

	statusBar: function (data) {

		// Default options
		data 									|| ( data 								= {} );
		data.backgroundColor	|| ( data.backgroundColor	= "#FFF" );
		data.color 						|| ( data.color 					= "#000" );
		data.font 						|| ( data.font 						= 'lighter 10px sans-serif' );

		this.addDebugAction('statusBar', data);
	},

	setStatBar: function (txt) {
	  if (!gbox._statbar) createStatBar();
		gbox._statbar.innerHTML = ( txt || "&nbsp" );

		function createStatBar() {
			if( !gbox._debugTool.statusBar ) return false;

			var statbar = document.createElement("div");
			if (gbox._border) statbar.style.border = "1px solid black";
			statbar.style.margin = "auto";
			statbar.style.backgroundColor = gbox._debugTool.statusBar.backgroundColor;
			statbar.style.font = gbox._debugTool.statusBar.font;
			statbar.style.color = gbox._debugTool.statusBar.color;
			statbar.style.width = ( gbox._camera.w * gbox._zoom ) + "px";
			gbox._container.appendChild(statbar);
			gbox._statbar = statbar;
		}

	},

	// Add a new debig utility and its data
	addDebugAction: function  ( name, data ) {
			gbox._debugTool[name] = data;
	},

	run: function (data) {

		if(data.fpsCounter) {

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

		if(data.statusBar) {
			var statline = "Idle: " + gbox._framestart + "/" + gbox._mspf + (gbox._frameskip > 0 ? " (" + gbox._frameskip + "skip)" : "" ) + " | ";
			var cnt = 0, g = 0;
			for ( g = 0; g < gbox._groups.length; g++ )
				if ( gbox._groupplay[gbox._groups[g]] ) {
					cnt = 0;
					for (var obj in gbox._objects[gbox._groups[g]]) cnt++;
					if (cnt) statline += gbox._groups[g] + "[" + cnt + "] ";
				}
			cnt = 0;
			var ply = 0;
			for (g in AkihabaraAudio._audio.aud)
				for (var x = 0; x < AkihabaraAudio._audio.aud[g].length; x++) {
					cnt++;
					if (!AkihabaraAudio._audio.aud[g][x].paused && !AkihabaraAudio._audio.aud[g][x].ended) ply++;
				}
			statline += "| audio: " + ply + "/" + cnt + ":" + AkihabaraAudio._audioteam;

			if( AkihabaraAudio._totalAudioMute ) statline += ' MUTE ON';
			if( gbox._pauseGame ) statline += ' | PAUSE ON';

			this.setStatBar(statline);
		}

	}

};

// End file
// Testing access
