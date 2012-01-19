// ---
// ---
// ---  AUDIO ENGINE
// ---
// ---

var AkihabaraAudio = {
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
		if (AkihabaraAudio._audiocompatmode === 1) {
			if (su.duration - su.currentTime > AkihabaraAudio._fakestoptime) {
				su.currentTime = su.duration - AkihabaraAudio._fakestoptime;
			}
			su.muted = true;
		} else {
			su.pause();
		}
	},

	_rawplayaudio: function(su) {
		if (AkihabaraAudio._audiocompatmode === 1) {
			try { su.currentTime = 0; } catch (e) {}
			su.muted = false;
			su.play();
		} else if (AkihabaraAudio._audiocompatmode === 2) {
			su.load();
			AkihabaraAudio._playerforcer = setInterval(function(e) {
				try {
					su.play();
					clearInterval(AkihabaraAudio._playerforcer);
				} catch (e) {}
			}, 1000);
		} else {
			try { su.currentTime = 0; } catch (e) {}
			su.play();
			if (AkihabaraAudio._totalMute) {
				AkihabaraAudio.totalAudioMute();
			}
		}
	},

	_finalizeaudio: function(ob, who, donext) {
		var cur = (who ? who : this);
		gbox.removeEventListener(cur, 'ended', AkihabaraAudio._finalizeaudio);
		gbox.removeEventListener(cur, 'timeupdate', AkihabaraAudio._checkprogress);

		gbox.addEventListener(cur, 'ended', AkihabaraAudio._playbackended);
		if (donext) {
			gbox._loaderloaded();
		}
	},

	_audiodoload: function() {
		if (AkihabaraAudio._audiocompatmode === 1) {
			AkihabaraAudio._audio.lding.muted = true;
		} else {
			if (AkihabaraAudio._audiocompatmode === 2) {
				AkihabaraAudio._finalizeaudio(null, AkihabaraAudio._audio.lding, true);
			} else {
				AkihabaraAudio._audio.lding.load();
				AkihabaraAudio._audio.lding.play();
			}
		}
	},

	_timedfinalize: function() {
		AkihabaraAudio._rawstopaudio(AkihabaraAudio._audio.lding);
		AkihabaraAudio._finalizeaudio(null, AkihabaraAudio._audio.lding, true);
	},

	_checkprogress: function() {
		if (AkihabaraAudio._audio.lding.currentTime > AkihabaraAudio._audioprefetch) {
			AkihabaraAudio._timedfinalize();
		}
	},

	_fakecheckprogress: function() {
		if (AkihabaraAudio._audio.lding.currentTime > AkihabaraAudio._audioprefetch) {
			AkihabaraAudio._timedfinalize();
		} else {
			setTimeout(AkihabaraAudio._fakecheckprogress, AkihabaraAudio._fakecheckprogressspeed);
		}
	},

	_audiofiletomime: function(f) {
		var fsp = f.split(".");
		switch (fsp.pop().toLowerCase()) {
		case "ogg":
			return "audio/ogg";
		case "mp3":
			return "audio/mpeg";
		default:
			return "audio/mpeg";
		}
	},

	_pushaudio: function() { try {this.currentTime = 1.0; } catch (e) {} },

	_createnextaudio: function(cau) {
		var ael, i;

		if (cau.def) {
			this.deleteAudio(cau.id);
			AkihabaraAudio._audio.aud[cau.id] = [];
			AkihabaraAudio._audio.ast[cau.id] = {cy: -1, volume: 1, channel: null, play: false, mute: false, filename: cau.filename[0]};
			if (cau.def) {
				for (var a in cau.def) {
					AkihabaraAudio._audio.ast[cau.id][a] = cau.def[a];
				}
			}
		}
		if ((AkihabaraAudio._createmode === 0) && (cau.team > 0)) {
			ael = AkihabaraAudio._audio.aud[cau.id][0].cloneNode(true);
			AkihabaraAudio._finalizeaudio(null, ael, false);
		} else {
			ael = document.createElement('audio');
			ael.volume = AkihabaraAudio._audiomutevolume;
		}
		if (!AkihabaraAudio._showplayers) {
			ael.style.display = "none";
			ael.style.visibility = "hidden";
			ael.style.width = "1px";
			ael.style.height = "1px";
			ael.style.position = "absolute";
			ael.style.left = "0px";
			ael.style.top = "-1000px";
		}
		ael.setAttribute('controls', AkihabaraAudio._showplayers);
		ael.setAttribute('aki_id', cau.id);
		ael.setAttribute('aki_cnt', cau.team);
		gbox.addEventListener(ael, 'loadedmetadata', AkihabaraAudio._pushaudio); // Push locked audio in safari
		if (((AkihabaraAudio._createmode === 0) && (cau.team == 0)) || (AkihabaraAudio._createmode === 1)) {
			if (AkihabaraAudio._forcedmimeaudio) {
				for (i = 0; i < cau.filename.length; i++) {
					if (AkihabaraAudio._audiofiletomime(cau.filename[i]).indexOf(AkihabaraAudio._forcedmimeaudio) !== -1) {
						ael.src = gbox._breakcacheurl(cau.filename[i]);
						break;
					}
				}
			} else if (ael.canPlayType) {
				var cmime;
				for (i = 0; i < cau.filename.length; i++) {
					cmime = AkihabaraAudio._audiofiletomime(cau.filename[i]);
					if (("no" !== ael.canPlayType(cmime)) && ("" !== ael.canPlayType(cmime))) {
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
			gbox.addEventListener(ael, 'ended', AkihabaraAudio._finalizeaudio);
			if (AkihabaraAudio._audiocompatmode === 1) {
				setTimeout(AkihabaraAudio._fakecheckprogress, AkihabaraAudio._fakecheckprogressspeed);
			} else {
				gbox.addEventListener(ael, 'timeupdate', AkihabaraAudio._checkprogress);
			}
			ael.setAttribute('buffering', "auto");
			ael.volume = 0;
			AkihabaraAudio._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			AkihabaraAudio._audio.lding = ael;
			setTimeout(AkihabaraAudio._audiodoload, 1);
		} else {
			AkihabaraAudio._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			gbox._loaderloaded();
		}
	},

	_playbackended: function(e) {
		if (AkihabaraAudio._audio.ast[this.getAttribute('aki_id')].cy === this.getAttribute('aki_cnt')) {
			if (AkihabaraAudio._audio.ast[this.getAttribute('aki_id')].play && AkihabaraAudio._audio.ast[this.getAttribute('aki_id')].loop) {
				if (AkihabaraAudio._audiocompatmode === 2) {
					AkihabaraAudio._rawplayaudio(this);
				} else {
					this.currentTime = 0;
				}
			} else {
				AkihabaraAudio._audio.ast[this.getAttribute('aki_id')].play = false;
			}
		} else {
			if (AkihabaraAudio._audiocompatmode === 1) {
				this.pause();
				this.muted = false;
			}
		}
	},

	_updateaudio: function(a) {
		if (AkihabaraAudio._audio.ast[a].play) {
			AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy].volume = (AkihabaraAudio._audio.ast[a].mute ? AkihabaraAudio._audiomutevolume : AkihabaraAudio._audiomastervolume * (AkihabaraAudio._audio.ast[a].volume != null ? AkihabaraAudio._audio.ast[a].volume : 1) * ((AkihabaraAudio._audio.ast[a].channel != null) && (AkihabaraAudio._audiochannels[AkihabaraAudio._audio.ast[a].channel] != null) && (AkihabaraAudio._audiochannels[AkihabaraAudio._audio.ast[a].channel].volume != null) ? AkihabaraAudio._audiochannels[AkihabaraAudio._audio.ast[a].channel].volume : 1));
		}
	},

	_addqueue: function(a) {
		if (!AkihabaraAudio._audiodequeuetime) {
			AkihabaraAudio._dequeueaudio(null, a);
		} else {
			AkihabaraAudio._audioactions.push(a);
			if (!AkihabaraAudio._audio.qtimer) {
				AkihabaraAudio._audio.qtimer = true;
				setTimeout(AkihabaraAudio._dequeueaudio, AkihabaraAudio._audiodequeuetime);
			}
		}
	},

	_dequeueaudio: function(k, rt) {
		var ac = (rt ? rt : AkihabaraAudio._audioactions.pop());
		switch (ac.t) {
		case 0:
			AkihabaraAudio._updateaudio(ac.a.getAttribute("aki_id"));
			AkihabaraAudio._rawplayaudio(ac.a);
			break;
		case 1:
			AkihabaraAudio._rawstopaudio(ac.a);
			break;
		case 2:
			AkihabaraAudio._updateaudio(ac.a.getAttribute("aki_id"));
			break;
		}
		if (!rt && AkihabaraAudio._audioactions.length) {
			AkihabaraAudio._audio.qtimer = true;
			setTimeout(AkihabaraAudio._dequeueaudio, AkihabaraAudio._audiodequeuetime);
		} else {
			AkihabaraAudio._audio.qtimer = false;
		}
	},

	getAudioIsSingleChannel: function() { return AkihabaraAudio._singlechannelaudio; },
	setAudioIsSingleChannel: function(m) { AkihabaraAudio._singlechannelaudio = m; },
	setAudioPositionDelay: function(m) { AkihabaraAudio._positiondelay = m; },
	setAudioDequeueTime: function(m) { AkihabaraAudio._audiodequeuetime = m; },
	setShowPlayers: function(m) { AkihabaraAudio._showplayers = m; },
	setAudioCompatMode: function(m) { AkihabaraAudio._audiocompatmode = m; },
	setAudioCreateMode: function(m) { AkihabaraAudio._createmode = m; },

	addAudio: function(id, filename, def) {
		if (AkihabaraAudio._canaudio) {
			if (AkihabaraAudio._audio.aud[id]) {
				if (AkihabaraAudio._audio.ast[id].filename === filename[0]) {
					return;
				} else {
					this.deleteAudio(id);
				}
			}
			if (!AkihabaraAudio._singlechannelaudio || (def.channel === AkihabaraAudio._singlechannelname)) {
				var grsize = (def.channel === AkihabaraAudio._singlechannelname ? AkihabaraAudio._loweraudioteam : (def.background ? AkihabaraAudio._loweraudioteam : AkihabaraAudio._audioteam));
				for (var i = 0; i < grsize; i++) {
					gbox._addtoloader({type: "audio", data: {id: id, filename: filename, def: (i === 0 ? def : null), team: i}});
				}
			}
		}
	},

	deleteAudio: function(id) {
		if (AkihabaraAudio._audio.aud[id]) {
			for (var i = 0; i < AkihabaraAudio._audio.aud[id].length; i++) {
				try {document.body.removeChild(AkihabaraAudio._audio.aud[id][i]); } catch (e) {}
				delete AkihabaraAudio._audio.aud[id][i];
			}
			delete AkihabaraAudio._audio.aud[id];
			if (AkihabaraAudio._audio.ast[id]) {
				delete AkihabaraAudio._audio.ast[id];
			}
		}
	},

	playAudio: function(a, data) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) {
			if (!AkihabaraAudio._audio.ast[a].play) {
				this.hitAudio(a, data);
			}
		}
	},

	hitAudio: function(a, data) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) {
			var ael;
			if (AkihabaraAudio._audio.ast[a].cy !== -1) {
				this.stopAudio(a, true);
			}
			AkihabaraAudio._audio.ast[a].cy = (AkihabaraAudio._audio.ast[a].cy + 1) % AkihabaraAudio._audio.aud[a].length;
			ael = AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy];
			if (data) {
				for (var n in data) { AkihabaraAudio._audio.ast[a][n] = data[n]; }
			}
			AkihabaraAudio._audio.ast[a].play = true;
			AkihabaraAudio._addqueue({t: 0, a: ael});
		}
	},

	stopAudio: function(a, permissive) {
		if (AkihabaraAudio._canaudio) {
			var ael;
			if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a] && AkihabaraAudio._audio.ast[a].play) {
				AkihabaraAudio._audio.ast[a].play = false;
				ael = AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy];
				if (ael.duration - 1.5 > 0) {
					AkihabaraAudio._addqueue({t: 1, a: ael});
				}
			}
		}
	},

	resetChannel: function(ch) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audiochannels[ch]) {
			if (ch === "master") {
				for (var cha in AkihabaraAudio._audiochannels) {
					this.setChannelVolume(cha, AkihabaraAudio._audiochannels[cha]._def.volume);
				}
			} else {
				if (AkihabaraAudio._audiochannels[ch]) {
					this.setChannelVolume(ch, AkihabaraAudio._audiochannels[ch]._def.volume);
				}
			}
		}
	},

	getChannelDefaultVolume: function(ch) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audiochannels[ch]) {
			return AkihabaraAudio._audiochannels[ch]._def.volume;
		} else {
			return null;
		}
	},

	setChannelVolume: function(ch, a) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audiochannels[ch]) {
			if (ch === "master") {
				AkihabaraAudio._audiomastervolume = a;
			} else {
				AkihabaraAudio._audiochannels[ch].volume = a;
			}
			for (var j in AkihabaraAudio._audio.aud) {
				if (AkihabaraAudio._audio.ast[j].cy > -1) {
					AkihabaraAudio._updateaudio(j);
				}
			}
		}
	},

	getChannelVolume: function(ch) {
		if (ch === "master") {
			return AkihabaraAudio._audiomastervolume;
		} else {
			if (AkihabaraAudio._audiochannels[ch]) {
				return AkihabaraAudio._audiochannels[ch].volume;
			} else {
				return 0;
			}
		}
	},

	changeChannelVolume: function(ch, a) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audiochannels[ch]) {
			var vol = this.getChannelVolume(ch) + a;
			if (vol > 1) {
				vol = 1;
			} else {
				if (vol < 0) {
					vol = 0;
				}
			}
			this.setChannelVolume(ch, vol);
		}
	},

	stopChannel: function(ch) {
		if (AkihabaraAudio._canaudio) {
			for (var j in AkihabaraAudio._audio.aud) {
				if (AkihabaraAudio._audio.ast[j].cy > -1 && AkihabaraAudio._audio.ast[j].play && ((ch === "master") || (AkihabaraAudio._audio.ast[j].channel === ch))) {
					this.stopAudio(j);
				}
			}
		}
	},

	totalAudioMute: function() {
		AkihabaraAudio._totalMute = true;
		for (var j in AkihabaraAudio._audio.aud) {
			AkihabaraAudio.setAudioMute(j);
		}
	},

	totalAudioUnmute: function() {
		AkihabaraAudio._totalMute = false;
		for (var j in AkihabaraAudio._audio.aud) {
			AkihabaraAudio.setAudioUnmute(j);
		}
	},

	setAudioUnmute: function(a) { if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) { AkihabaraAudio._audio.ast[a].mute = false; AkihabaraAudio._updateaudio(a); } },
	setAudioMute: function(a) { if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) { AkihabaraAudio._audio.ast[a].mute = true; AkihabaraAudio._updateaudio(a); } },
	getAudioMute: function(a) { if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) { return AkihabaraAudio._audio.ast[a].mute; } else { return null; } },

	setAudioVolume: function(a, vol) { if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) { AkihabaraAudio._audio.ast[a].volume = vol; AkihabaraAudio._updateaudio(a); } },
	getAudioVolume: function(a, vol) { if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) { return AkihabaraAudio._audio.ast[a].volume; } else { return null; } },

	setAudioPosition: function(a, p) {  if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a] && AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy]) { AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy].currentTime = p; } },

	getAudioPosition: function(a) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a] && AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy]) {
			if (AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy].currentTime > AkihabaraAudio._positiondelay) {
				return AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy].currentTime - AkihabaraAudio._positiondelay;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	},

	getAudioDuration: function(a) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a] && AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy]) {
			return AkihabaraAudio._audio.aud[a][AkihabaraAudio._audio.ast[a].cy].duration;
		} else {
			return 0;
		}
	},

	changeAudioVolume: function(a, vol) {
		if (AkihabaraAudio._canaudio && AkihabaraAudio._audio.ast[a]) {
			if (AkihabaraAudio._audio.ast[a].volume + vol > 1) {
				AkihabaraAudio._audio.ast[a].volume = 1;
			} else {
				if (AkihabaraAudio._audio.ast[a].volume + vol < 0) {
					AkihabaraAudio._audio.ast[a].volume = 0;
				} else {
					AkihabaraAudio._audio.ast[a].volume += vol;
					AkihabaraAudio._updateaudio(a);
				}
			}
		}
	},

	setCanAudio: function(a) { AkihabaraAudio._canaudio = !gbox._flags.noaudio && a; },
	setForcedMimeAudio: function(a) { AkihabaraAudio._forcedmimeaudio = a; },

	setAudioChannels: function(a) {
		AkihabaraAudio._audiochannels = a;
		for (var ch in a) {
			AkihabaraAudio._audiochannels[ch]._def = {};
			for (var attr in AkihabaraAudio._audiochannels[ch]) {
				if (attr !== "_def") {
					AkihabaraAudio._audiochannels[ch]._def[attr] = AkihabaraAudio._audiochannels[ch][attr];
				}
			}
		}
	},

	setAudioTeam: function(a) { AkihabaraAudio._audioteam = a; },
	setLowerAudioTeam: function(a) { AkihabaraAudio._loweraudioteam = a; }
};
