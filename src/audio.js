// ---
// ---
// ---  AUDIO ENGINE
// ---
// ---

var audio={
	_audiochannels:{},
	_audiomastervolume:1.0,
	_canaudio:false,
	_audiodequeuetime:0,
	_audioprefetch:0.5,
	_audiocompatmode:0, // 0: pause/play, 1: google chrome compatibility, 2: ipad compatibility (single channel)
	_createmode:0, // 0: clone, 1: rehinstance
	_fakecheckprogressspeed:100, // Frequency of fake audio monitoring
	_fakestoptime:1, // Fake audio stop for compatibility mode
	_audioteam:2,
	_loweraudioteam:1,
	_audio:{lding:null,qtimer:false,aud:{},ast:{}},
	_audioactions:[],
	_showplayers:false,
	_singlechannelname:"bgmusic",
	_positiondelay:0,
	_playerforcer:0,
	_forcedmimeaudio:null,
	_singlechannelaudio:false,
	_audiomutevolume:0.0001, // Zero is still not accepted by everyone :(
	_rawstopaudio:function(su) {
		if (this._audiocompatmode==1) {
			if (su.duration-su.currentTime>this._fakestoptime)
				su.currentTime=su.duration-this._fakestoptime;
			su.muted=true;
		} else
			su.pause();
	},

	_rawplayaudio:function(su) {
		if (this._audiocompatmode==1) {
			try { su.currentTime=0; } catch (e) {}
			su.muted=false;
			su.play();
		} else if (this._audiocompatmode==2) {
			su.load();
			this._playerforcer=setInterval(function(e){try{su.play();clearInterval(this._playerforcer);}catch(e){}},1000);
		} else {
			try { su.currentTime=0; } catch(e){}
			su.play();
		}
	},

	_finalizeaudio:function(ob,who,donext){
		var cur=(who?who:this);
		gbox.removeEventListener(cur,'ended', this._finalizeaudio);
		gbox.removeEventListener(cur,'timeupdate', this._checkprogress);

		gbox.addEventListener(cur,'ended', this._playbackended);
		if (donext) gbox._loaderloaded();
	},

	_audiodoload:function() {
		if (this._audiocompatmode==1) this._audio.lding.muted=true;
		else if (this._audiocompatmode==2)
			this._finalizeaudio(null,this._audio.lding,true);
		else {
			this._audio.lding.load();
			this._audio.lding.play();
		}
	},

	_timedfinalize:function() {
		this._rawstopaudio(this._audio.lding);
		this._finalizeaudio(null,this._audio.lding,true);
	},

	_checkprogress:function() {
		if (this._audio.lding.currentTime>this._audioprefetch) this._timedfinalize();
	},

	_fakecheckprogress:function() {
		if (this._audio.lding.currentTime>this._audioprefetch) this._timedfinalize(); else setTimeout(this._fakecheckprogress,this._fakecheckprogressspeed);
	},

	_audiofiletomime:function(f) {
		var fsp=f.split(".");
		switch (fsp.pop().toLowerCase()) {
			case "ogg": return "audio/ogg";
			case "mp3": return "audio/mpeg";
			default: return "audio/mpeg";
		}
	},

	_pushaudio:function(){try {this.currentTime=1.0; } catch(e){} },
	_createnextaudio:function(cau) {
		var ael,i;

		if (cau.def) {
			this.deleteAudio(cau.id);
			this._audio.aud[cau.id]=[];
			this._audio.ast[cau.id]={cy:-1,volume:1,channel:null,play:false,mute:false,filename:cau.filename[0]};
			if (cau.def) for (var a in cau.def) this._audio.ast[cau.id][a]=cau.def[a];
		}
		if ((this._createmode==0)&&(cau.team>0)) {
			ael =this._audio.aud[cau.id][0].cloneNode(true);
			this._finalizeaudio(null,ael,false);
		} else {
			ael=document.createElement('audio');
			ael.volume=this._audiomutevolume;
		}
		if (!this._showplayers) {
			ael.style.display="none";
			ael.style.visibility="hidden";
			ael.style.width="1px";
			ael.style.height="1px";
			ael.style.position="absolute";
			ael.style.left="0px";
			ael.style.top="-1000px";
		}
		ael.setAttribute('controls',this._showplayers);
		ael.setAttribute('aki_id',cau.id);
		ael.setAttribute('aki_cnt',cau.team);
		gbox.addEventListener(ael,'loadedmetadata', this._pushaudio); // Push locked audio in safari
		if (((this._createmode==0)&&(cau.team==0))||(this._createmode==1)) {
			if (this._forcedmimeaudio) {
				for (i=0;i<cau.filename.length;i++) {
					if (this._audiofiletomime(cau.filename[i]).indexOf(this._forcedmimeaudio)!=-1) {
						ael.src=gbox._breakcacheurl(cau.filename[i]);
						break;
					}
				}
			} else if (ael.canPlayType) {
				var cmime;
				for (i=0;i<cau.filename.length;i++) {
					cmime=this._audiofiletomime(cau.filename[i]);
					if (("no" != ael.canPlayType(cmime)) && ("" != ael.canPlayType(cmime))) {
						ael.src=gbox._breakcacheurl(cau.filename[i]);
						break;
					}
				}
			} else {
				for (i=0;i<cau.filename.length;i++) {
					var src=document.createElement('source');
					src.setAttribute('src', gbox._breakcacheurl(cau.filename[i]));
					ael.appendChild(src);
				}
			}
			gbox.addEventListener(ael,'ended',this._finalizeaudio);
			if (this._audiocompatmode==1)
				setTimeout(this._fakecheckprogress,this._fakecheckprogressspeed);
			else
				gbox.addEventListener(ael,'timeupdate',this._checkprogress);
			ael.setAttribute('buffering',"auto");
			ael.volume=0;
			this._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			this._audio.lding=ael;
			setTimeout(this._audiodoload,1);
		} else {
			this._audio.aud[cau.id].push(ael);
			document.body.appendChild(ael);
			gbox._loaderloaded();
		}
	},

	_playbackended:function(e) {
		if (this._audio.ast[this.getAttribute('aki_id')].cy==this.getAttribute('aki_cnt')) {
			if (this._audio.ast[this.getAttribute('aki_id')].play&&this._audio.ast[this.getAttribute('aki_id')].loop)
				if (this._audiocompatmode==2)
					this._rawplayaudio(this);
				else
					this.currentTime=0;
			else
				this._audio.ast[this.getAttribute('aki_id')].play=false;
		} else if (this._audiocompatmode==1) {
			this.pause();
			this.muted=false;
		}
	},

	_updateaudio:function(a) {
		if (this._audio.ast[a].play) {
			this._audio.aud[a][this._audio.ast[a].cy].volume=(this._audio.ast[a].mute?this._audiomutevolume:
				this._audiomastervolume*
				(this._audio.ast[a].volume!=null?this._audio.ast[a].volume:1)*
				((this._audio.ast[a].channel!=null)&&(this._audiochannels[this._audio.ast[a].channel]!=null)&&(this._audiochannels[this._audio.ast[a].channel].volume!=null)?this._audiochannels[this._audio.ast[a].channel].volume:1)
			);
		}
	},

	_addqueue:function(a) {
		if (!this._audiodequeuetime)
			this._dequeueaudio(null,a);
		else {
			this._audioactions.push(a);
			if (!this._audio.qtimer) {
				this._audio.qtimer=true;
				setTimeout(this._dequeueaudio,this._audiodequeuetime);
			}
		}
	},
	_dequeueaudio:function(k,rt) {
			var ac=(rt?rt:this._audioactions.pop());
			switch (ac.t) {
				case 0:
					this._updateaudio(ac.a.getAttribute("aki_id"));
					this._rawplayaudio(ac.a);
					break;
				case 1:
					this._rawstopaudio(ac.a);
					break;
				case 2:
					this._updateaudio(ac.a.getAttribute("aki_id"));
					break;
			}
			if (!rt&&this._audioactions.length) {
				this._audio.qtimer=true;
				setTimeout(this._dequeueaudio,this._audiodequeuetime);
			} else this._audio.qtimer=false;

	},

	getAudioIsSingleChannel:function() { return this._singlechannelaudio; },
	setAudioIsSingleChannel:function(m) { this._singlechannelaudio=m; },
	setAudioPositionDelay:function(m) { this._positiondelay=m; },
	setAudioDequeueTime:function(m) { this._audiodequeuetime=m; },
	setShowPlayers:function(m) { this._showplayers=m; },
	setAudioCompatMode:function(m) { this._audiocompatmode=m; },
	setAudioCreateMode:function(m) { this._createmode=m; },
	addAudio:function(id,filename,def) {
		if (this._canaudio) {
			if (this._audio.aud[id])
				if (this._audio.ast[id].filename==filename[0])
					return;
				else
					this.deleteAudio(id);
			if (!this._singlechannelaudio||(def.channel==this._singlechannelname)) {
				var grsize=(def.channel==this._singlechannelname?this._loweraudioteam:(def.background?this._loweraudioteam:this._audioteam));
				for (var i=0;i<grsize;i++)
					gbox._addtoloader({type:"audio",data:{id:id,filename:filename,def:(i==0?def:null),team:i}});
			}
		}
	},
	deleteAudio:function(id) {
		if (this._audio.aud[id]) {
			for (var i=0;i<this._audio.aud[id].length;i++) {
				try {document.body.removeChild(this._audio.aud[id][i]);}catch(e){}
				delete this._audio.aud[id][i];
			}
			delete this._audio.aud[id];
			if (this._audio.ast[id]) delete this._audio.ast[id];
		}
	},
	playAudio:function(a,data) {
		if (this._canaudio&&this._audio.ast[a])
			if (!this._audio.ast[a].play) this.hitAudio(a,data);
	},
	hitAudio:function(a,data) {
		if (this._canaudio&&this._audio.ast[a]) {
			var ael;
			if (this._audio.ast[a].cy!=-1)
				this.stopAudio(a,true);
			this._audio.ast[a].cy=(this._audio.ast[a].cy+1)%this._audio.aud[a].length;
			ael=this._audio.aud[a][this._audio.ast[a].cy];
			if (data)
				for (var n in data) this._audio.ast[a][n]=data[n];
			this._audio.ast[a].play=true;
			this._addqueue({t:0,a:ael});
		}
	},
	stopAudio:function(a,permissive) {
		if (this._canaudio) {
			var ael;
			if (this._canaudio&&this._audio.ast[a]&&this._audio.ast[a].play) {
				this._audio.ast[a].play=false;
				ael=this._audio.aud[a][this._audio.ast[a].cy];
				if (ael.duration-1.5>0)
					this._addqueue({t:1,a:ael});
			}
		}
	},
	resetChannel:function(ch) {
		if (this._canaudio&&this._audiochannels[ch])
			if (ch=="master")
				for (var cha in this._audiochannels)
					this.setChannelVolume(cha,this._audiochannels[cha]._def.volume);
			else if (this._audiochannels[ch])
				this.setChannelVolume(ch,this._audiochannels[ch]._def.volume);
	},
	getChannelDefaultVolume:function(ch) {
		if (this._canaudio&&this._audiochannels[ch]) return this._audiochannels[ch]._def.volume; else return null;
	},
	setChannelVolume:function(ch,a) {
		if (this._canaudio&&this._audiochannels[ch]) {
			if (ch=="master") this._audiomastervolume=a; else this._audiochannels[ch].volume=a;
			for (var j in this._audio.aud)
				if (this._audio.ast[j].cy>-1) this._updateaudio(j);
		}
	},
	getChannelVolume:function(ch) { if (ch=="master") return this._audiomastervolume; else if (this._audiochannels[ch]) return this._audiochannels[ch].volume; else return 0; },
	changeChannelVolume:function(ch,a) {
		if (this._canaudio&&this._audiochannels[ch]) {
			var vol=this.getChannelVolume(ch)+a;
			if (vol>1) vol=1; else if (vol<0) vol=0;
			this.setChannelVolume(ch,vol);
		}
	},
	stopChannel:function(ch) {
		if (this._canaudio)
			for (var j in this._audio.aud)
				if (this._audio.ast[j].cy>-1&&this._audio.ast[j].play&&((ch=="master")||(this._audio.ast[j].channel==ch)))
					this.stopAudio(j);
	},

	setAudioUnmute:function(a) { if (this._canaudio&&this._audio.ast[a]) { this._audio.ast[a].mute=false; this._updateaudio(a); } },
	setAudioMute:function(a) { if (this._canaudio&&this._audio.ast[a]) { this._audio.ast[a].mute=true; this._updateaudio(a); } },
	getAudioMute:function(a) { if (this._canaudio&&this._audio.ast[a]) return this._audio.ast[a].mute; else return null; },

	setAudioVolume:function(a,vol) { if (this._canaudio&&this._audio.ast[a]) { this._audio.ast[a].volume=vol; this._updateaudio(a); } },
	getAudioVolume:function(a,vol) { if (this._canaudio&&this._audio.ast[a]) return this._audio.ast[a].volume; else return null; },

	setAudioPosition:function(a,p) {  if (this._canaudio&&this._audio.ast[a]&&this._audio.aud[a][this._audio.ast[a].cy]) this._audio.aud[a][this._audio.ast[a].cy].currentTime=p;},
	getAudioPosition:function(a) {if (this._canaudio&&this._audio.ast[a]&&this._audio.aud[a][this._audio.ast[a].cy]) if (this._audio.aud[a][this._audio.ast[a].cy].currentTime>this._positiondelay) return this._audio.aud[a][this._audio.ast[a].cy].currentTime-this._positiondelay; else return 0; else return 0; },

	getAudioDuration:function(a) {if (this._canaudio&&this._audio.ast[a]&&this._audio.aud[a][this._audio.ast[a].cy]) return this._audio.aud[a][this._audio.ast[a].cy].duration; else return 0; },

	changeAudioVolume:function(a,vol) { if (this._canaudio&&this._audio.ast[a]) { if (this._audio.ast[a].volume+vol>1) this._audio.ast[a].volume=1; else  if (this._audio.ast[a].volume+vol<0) this._audio.ast[a].volume=0; else this._audio.ast[a].volume+=vol; this._updateaudio(a); } },
	setCanAudio:function(a) { this._canaudio=!gbox._flags.noaudio&&a;},
	setForcedMimeAudio:function(a){ this._forcedmimeaudio=a;},
	setAudioChannels:function(a){
		this._audiochannels=a;
		for (var ch in a) {
			this._audiochannels[ch]._def={};
			for (var attr in this._audiochannels[ch])
				if (attr!="_def") this._audiochannels[ch]._def[attr]=this._audiochannels[ch][attr];
		}
	},
	setAudioTeam:function(a){ this._audioteam=a; },
	setLowerAudioTeam:function(a){ this._loweraudioteam=a; }
}
