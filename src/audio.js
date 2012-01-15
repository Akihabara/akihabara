// ---
// ---
// ---  AUDIO ENGINE
// ---
// ---

var audio = {
	_totalMute: false,
	_audiochannels: {},
	_audiomastervolume: 1.0,
	_canaudio: false,
	_audiodequeuetime: 0,
	_audioprefetch: 0.5,
	_audiocompatmode: 0, // 0: pause/play, 1: google chrome compatibility, 2: ipad compatibility (single channel)
	_createmode: 0, // 0: clone, 1: rehinstance
	_fakecheckprogressspeed: 100, // Frequency of fake audio monitoring
	_fakestoptime: 1, // Fake audio stop for compatibility mode
	_audioteam: 2,
	_loweraudioteam: 1,
	_audio: {lding: null, qtimer: false, aud: {}, ast: {}},
	_audioactions: [],
	_showplayers: false,
	_singlechannelname: "bgmusic",
	_positiondelay: 0,
	_playerforcer: 0,
	_forcedmimeaudio: null,
	_singlechannelaudio: false,
	_audiomutevolume: 0.0001, // Zero is still not accepted by everyone :(
	_rawstopaudio: function(su) {
		if (audio._audiocompatmode == 1) {
			if (su.duration-su.currentTime > audio._fakestoptime)
				su.currentTime = su.duration-audio._fakestoptime;
			su.muted = true;
		} else
			su.pause();
	},

	_rawplayaudio: function(su) {
		if (audio._audiocompatmode == 1) {
			try { su.currentTime = 0; } catch (e) {}
			su.muted = false;
			su.play();
		} else if (audio._audiocompatmode == 2) {
			su.load();
			audio._playerforcer = setInterval(function(e){ try{su.play(); clearInterval(audio._playerforcer); }catch(e){ }}, 1000);
		} else {
			try { su.currentTime = 0; } catch(e){ }
			su.play();
			if(audio._totalMute) audio.totalAudioMute();
		}
	},

	_finalizeaudio: function(ob, who, donext){
		var cur = (who?who: this);
		gbox.removeEventListener(cur, 'ended', audio._finalizeaudio);
		gbox.removeEventListener(cur, 'timeupdate', audio._checkprogress);

		gbox.addEventListener(cur, 'ended', audio._playbackended);
		if (donext) gbox._loaderloaded();
	},

	_audiodoload: function() {
		if (audio._audiocompatmode == 1) audio._audio.lding.muted = true;
		else if (audio._audiocompatmode == 2)
			audio._finalizeaudio(null, audio._audio.lding, true);
		else {
			audio._audio.lding.load();
			audio._audio.lding.play();
		}
	},

	_timedfinalize: function() {
		audio._rawstopaudio(audio._audio.lding);
		audio._finalizeaudio(null, audio._audio.lding, true);
	},

	_checkprogress: function() {
		if (audio._audio.lding.currentTime > audio._audioprefetch) audio._timedfinalize();
	},

	_fakecheckprogress: function() {
		if (audio._audio.lding.currentTime > audio._audioprefetch) audio._timedfinalize(); else setTimeout(audio._fakecheckprogress, audio._fakecheckprogressspeed);
	},

	_audiofiletomime: function(f) {
		var fsp = f.split(".");
		switch (fsp.pop().toLowerCase()) {
			case "ogg": return "audio/ogg";
			case "mp3": return "audio/mpeg";
			default: return "audio/mpeg";
		}
	},

	_pushaudio: function(){ try {this.currentTime = 1.0; } catch(e){ } },
	_createnextaudio: function(cau) {
		var ael, i;

		if (cau.def) {
			this.deleteAudio(cau.id);
			audio._audio.aud[cau.id] = [];
			audio._audio.ast[cau.id] = {cy: -1, volume: 1, channel: null, play: false, mute: false, filename: cau.filename[0]};
			if (cau.def) for (var a in cau.def) audio._audio.ast[cau.id][a] = cau.def[a];
		}
		if ((audio._createmode == 0) && (cau.team > 0)) {
			ael =audio._audio.aud[cau.id][0].cloneNode(true);
			audio._finalizeaudio(null, ael, false);
		} else {
			ael = document.createElement('audio');
			ael.volume = audio._audiomutevolume;
		}
		if (!audio._showplayers) {
			ael.style.display = "none";
			ael.style.visibility = "hidden";
			ael.style.width = "1px";
			ael.style.height = "1px";
			ael.style.position = "absolute";
			ael.style.left = "0px";
			ael.style.top = "-1000px";
		}
		ael.setAttribute('controls',audio._showplayers);
		ael.setAttribute('aki_id',cau.id);
		ael.setAttribute('aki_cnt',cau.team);
		gbox.addEventListener(ael, 'loadedmetadata', audio._pushaudio); // Push locked audio in safari
		if (((audio._createmode == 0) && (cau.team == 0)) || (audio._createmode == 1)) {
			if (audio._forcedmimeaudio) {
				for (i = 0; i < cau.filename.length; i++) {
					if (audio._audiofiletomime(cau.filename[i]).indexOf(audio._forcedmimeaudio) != -1) {
						ael.src = gbox._breakcacheurl(cau.filename[i]);
						break;
					}
				}
			} else if (ael.canPlayType) {
				var cmime;
				for (i = 0; i < cau.filename.length; i++) {
					cmime = audio._audiofiletomime(cau.filename[i]);
					if (("no" != ael.canPlayType(cmime)) && ("" != ael.canPlayType(cmime))) {
						ael.src = gbox._breakcacheurl(cau.filename[i]);
						break;
					}
				}
			} else {
				for (i = 0; i < cau.filename.length; i++) {
					var src = document.createElement('source');
					src.setAttribute('src', gbox._breakcacheurl(cau.filename[i]));
					ael.appendChild(src);
				}
			}
			gbox.addEventListener(ael, 'ended',audio._finalizeaudio);
			if (audio._audiocompatmode == 1)
				setTimeout(audio._fakecheckprogress, audio._fakecheckprogressspeed);
			else
				gbox.addEventListener(ael, 'timeupdate',audio._checkprogress);
			ael.setAttribute('buffering',"auto");
			ael.volume = 0;
			audio._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			audio._audio.lding = ael;
			setTimeout(audio._audiodoload, 1);
		} else {
			audio._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			gbox._loaderloaded();
		}
	},

	_playbackended: function(e) {
		if (audio._audio.ast[this.getAttribute('aki_id')].cy == this.getAttribute('aki_cnt')) {
			if (audio._audio.ast[this.getAttribute('aki_id')].play && audio._audio.ast[this.getAttribute('aki_id')].loop)
				if (audio._audiocompatmode == 2)
					audio._rawplayaudio(this);
				else
					this.currentTime = 0;
			else
				audio._audio.ast[this.getAttribute('aki_id')].play = false;
		} else if (audio._audiocompatmode == 1) {
			this.pause();
			this.muted = false;
		}
	},

	_updateaudio: function(a) {
		if (audio._audio.ast[a].play) {
			audio._audio.aud[a][audio._audio.ast[a].cy].volume = (audio._audio.ast[a].mute?audio._audiomutevolume:
				audio._audiomastervolume*
				(audio._audio.ast[a].volume != null?audio._audio.ast[a].volume: 1)*
				((audio._audio.ast[a].channel != null) && (audio._audiochannels[audio._audio.ast[a].channel] != null) && (audio._audiochannels[audio._audio.ast[a].channel].volume != null)?audio._audiochannels[audio._audio.ast[a].channel].volume: 1)
			);
		}
	},

	_addqueue: function(a) {
		if (!audio._audiodequeuetime)
			audio._dequeueaudio(null, a);
		else {
			audio._audioactions.push(a);
			if (!audio._audio.qtimer) {
				audio._audio.qtimer = true;
				setTimeout(audio._dequeueaudio, audio._audiodequeuetime);
			}
		}
	},
	_dequeueaudio: function(k, rt) {
			var ac = (rt?rt: audio._audioactions.pop());
			switch (ac.t) {
				case 0:
					audio._updateaudio(ac.a.getAttribute("aki_id"));
					audio._rawplayaudio(ac.a);
					break;
				case 1:
					audio._rawstopaudio(ac.a);
					break;
				case 2:
					audio._updateaudio(ac.a.getAttribute("aki_id"));
					break;
			}
			if (!rt && audio._audioactions.length) {
				audio._audio.qtimer = true;
				setTimeout(audio._dequeueaudio, audio._audiodequeuetime);
			} else audio._audio.qtimer = false;

	},

	getAudioIsSingleChannel: function() { return audio._singlechannelaudio; },
	setAudioIsSingleChannel: function(m) { audio._singlechannelaudio = m; },
	setAudioPositionDelay: function(m) { audio._positiondelay = m; },
	setAudioDequeueTime: function(m) { audio._audiodequeuetime = m; },
	setShowPlayers: function(m) { audio._showplayers = m; },
	setAudioCompatMode: function(m) { audio._audiocompatmode = m; },
	setAudioCreateMode: function(m) { audio._createmode = m; },
	addAudio: function(id, filename, def) {
		if (audio._canaudio) {
			if (audio._audio.aud[id])
				if (audio._audio.ast[id].filename == filename[0])
					return;
				else
					this.deleteAudio(id);
			if (!audio._singlechannelaudio || (def.channel == audio._singlechannelname)) {
				var grsize = (def.channel == audio._singlechannelname?audio._loweraudioteam: (def.background?audio._loweraudioteam: audio._audioteam));
				for (var i = 0; i < grsize; i++)
					gbox._addtoloader({type: "audio",data: {id: id, filename: filename, def: (i == 0?def: null), team: i}});
			}
		}
	},
	deleteAudio: function(id) {
		if (audio._audio.aud[id]) {
			for (var i = 0; i < audio._audio.aud[id].length; i++) {
				try {document.body.removeChild(audio._audio.aud[id][i]); }catch(e){ }
				delete audio._audio.aud[id][i];
			}
			delete audio._audio.aud[id];
			if (audio._audio.ast[id]) delete audio._audio.ast[id];
		}
	},
	playAudio: function(a, data) {
		if (audio._canaudio && audio._audio.ast[a])
			if (!audio._audio.ast[a].play) this.hitAudio(a, data);
	},
	hitAudio: function(a, data) {
		if (audio._canaudio && audio._audio.ast[a]) {
			var ael;
			if (audio._audio.ast[a].cy != -1)
				this.stopAudio(a, true);
			audio._audio.ast[a].cy = (audio._audio.ast[a].cy + 1)%audio._audio.aud[a].length;
			ael = audio._audio.aud[a][audio._audio.ast[a].cy];
			if (data)
				for (var n in data) audio._audio.ast[a][n] = data[n];
			audio._audio.ast[a].play = true;
			audio._addqueue({t: 0, a: ael});
		}
	},
	stopAudio: function(a, permissive) {
		if (audio._canaudio) {
			var ael;
			if (audio._canaudio && audio._audio.ast[a] && audio._audio.ast[a].play) {
				audio._audio.ast[a].play = false;
				ael = audio._audio.aud[a][audio._audio.ast[a].cy];
				if (ael.duration-1.5 > 0)
					audio._addqueue({t: 1, a: ael});
			}
		}
	},
	resetChannel: function(ch) {
		if (audio._canaudio && audio._audiochannels[ch])
			if (ch == "master")
				for (var cha in audio._audiochannels)
					this.setChannelVolume(cha, audio._audiochannels[cha]._def.volume);
			else if (audio._audiochannels[ch])
				this.setChannelVolume(ch, audio._audiochannels[ch]._def.volume);
	},
	getChannelDefaultVolume: function(ch) {
		if (audio._canaudio && audio._audiochannels[ch]) return audio._audiochannels[ch]._def.volume; else return null;
	},
	setChannelVolume: function(ch, a) {
		if (audio._canaudio && audio._audiochannels[ch]) {
			if (ch == "master") audio._audiomastervolume = a; else audio._audiochannels[ch].volume = a;
			for (var j in audio._audio.aud)
				if (audio._audio.ast[j].cy > -1) audio._updateaudio(j);
		}
	},
	getChannelVolume: function(ch) { if (ch == "master") return audio._audiomastervolume; else if (audio._audiochannels[ch]) return audio._audiochannels[ch].volume; else return 0; },
	changeChannelVolume: function(ch, a) {
		if (audio._canaudio && audio._audiochannels[ch]) {
			var vol = this.getChannelVolume(ch) + a;
			if (vol > 1) vol = 1; else if (vol < 0) vol = 0;
			this.setChannelVolume(ch, vol);
		}
	},
	stopChannel: function(ch) {
		if (audio._canaudio)
			for (var j in audio._audio.aud)
				if (audio._audio.ast[j].cy > -1 && audio._audio.ast[j].play && ((ch == "master") || (audio._audio.ast[j].channel == ch)))
					this.stopAudio(j);
	},
	totalAudioMute: function(){
		audio._totalMute = true;
		for( var j in audio._audio.aud )
			audio.setAudioMute(j);
	},
	totalAudioUnmute: function(){
		audio._totalMute = false;
		for( var j in audio._audio.aud )
			audio.setAudioUnmute(j);
	},
	setAudioUnmute: function(a) { if (audio._canaudio && audio._audio.ast[a]) { audio._audio.ast[a].mute = false; audio._updateaudio(a); } },
	setAudioMute: function(a) { if (audio._canaudio && audio._audio.ast[a]) { audio._audio.ast[a].mute = true; audio._updateaudio(a); } },
	getAudioMute: function(a) { if (audio._canaudio && audio._audio.ast[a]) return audio._audio.ast[a].mute; else return null; },

	setAudioVolume: function(a, vol) { if (audio._canaudio && audio._audio.ast[a]) { audio._audio.ast[a].volume = vol; audio._updateaudio(a); } },
	getAudioVolume: function(a, vol) { if (audio._canaudio && audio._audio.ast[a]) return audio._audio.ast[a].volume; else return null; },

	setAudioPosition: function(a, p) {  if (audio._canaudio && audio._audio.ast[a] && audio._audio.aud[a][audio._audio.ast[a].cy]) audio._audio.aud[a][audio._audio.ast[a].cy].currentTime = p; },
	getAudioPosition: function(a) {if (audio._canaudio && audio._audio.ast[a] && audio._audio.aud[a][audio._audio.ast[a].cy]) if (audio._audio.aud[a][audio._audio.ast[a].cy].currentTime > audio._positiondelay) return audio._audio.aud[a][audio._audio.ast[a].cy].currentTime-audio._positiondelay; else return 0; else return 0; },

	getAudioDuration: function(a) {if (audio._canaudio && audio._audio.ast[a] && audio._audio.aud[a][audio._audio.ast[a].cy]) return audio._audio.aud[a][audio._audio.ast[a].cy].duration; else return 0; },

	changeAudioVolume: function(a, vol) { if (audio._canaudio && audio._audio.ast[a]) { if (audio._audio.ast[a].volume + vol > 1) audio._audio.ast[a].volume = 1; else  if (audio._audio.ast[a].volume + vol < 0) audio._audio.ast[a].volume = 0; else audio._audio.ast[a].volume += vol; audio._updateaudio(a); } },
	setCanAudio: function(a) { audio._canaudio = !gbox._flags.noaudio && a; },
	setForcedMimeAudio: function(a){ audio._forcedmimeaudio = a; },
	setAudioChannels: function(a){
		audio._audiochannels = a;
		for (var ch in a) {
			audio._audiochannels[ch]._def = {};
			for (var attr in audio._audiochannels[ch])
				if (attr != "_def") audio._audiochannels[ch]._def[attr] = audio._audiochannels[ch][attr];
		}
	},
	setAudioTeam: function(a){ audio._audioteam = a; },
	setLowerAudioTeam: function(a){ audio._loweraudioteam = a; }
}
