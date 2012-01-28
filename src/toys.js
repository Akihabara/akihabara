/**
 * Toys module provides lots of common routines during the game developing:
 * from effects for screen titles to HUD handling to platform/SHMUP/RPG oriented routines,
 * like jumping characters, Z-Indexed objects, bullets, sparks, staff rolls, bonus screens, dialogues etc.
 * @namespace AkihabaraToys
 */
var toys = {
	// State-based toys
	// CONSTANTS
	TOY_BUSY: 0,
	TOY_DONE: 1,
	TOY_IDLE: 2,

	// PRIVATE

	// Generical toys method

	resetToy: function (th, id) { if (th.toys) { delete th.toys[id]; } },
	getToyValue: function (th, id, v, def) { return ((th.toys == null) || (th.toys[id] == null) ? def : th.toys[id][v]); },
	getToyStatus: function (th, id) { return ((th.toys == null) || (th.toys[id] == null) ? toys.TOY_BUSY : th.toys[id].__status); },

	_toydone: function (th, id) {
		if (th.toys[id].__status < toys.TOY_IDLE) { th.toys[id].__status++; }
		return th.toys[id].__status;
	},

	_toybusy: function (th, id) {
		th.toys[id].__status = toys.TOY_BUSY;
		return th.toys[id].__status;
	},

	_toyfrombool: function (th, id, b) { return (b ? toys._toydone(th, id) : toys._toybusy(th, id)); },

	_maketoy: function (th, id) {
		if (!th.toys) { th.toys = {}; }
		if (!th.toys[id]) {
			th.toys[id] = {__status: toys.TOY_BUSY};
			return true;
		} else { return false; }
	},

	/**
	* Timer functionality based methods
	* @namespace AkihabaraTimer
	*/
	// Pure timers
	timer: {

		randomly: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].time = help.random(data.base, data.range);
			}
			if (th.toys[id].time) {
				th.toys[id].time--;
				return toys._toybusy(th, id);
			} else {
				th.toys[id].time = help.random(data.base, data.range);
				return toys._toydone(th, id);
			}
		},

		real: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].subtimer = gbox.getFps();
				th.toys[id].done = false;
				if (data.countdown) {
					th.toys[id].time = data.countdown;
				} else {
					th.toys[id].time = 0;
				}
			}
			th.toys[id].subtimer--;
			if (!th.toys[id].subtimer) {
				th.toys[id].subtimer = gbox.getFps();
				if (data.countdown) {
					if (th.toys[id].time) {
						th.toys[id].time--;
						if (data.audiocritical && (th.toys[id].time <= data.critical)) {
							AkihabaraAudio.hitAudio(data.audiocritical);
						}
					} else {
						th.toys[id].done = true;
					}
				} else {
					th.toys[id].time++;
				}
			}
			return toys._toyfrombool(th, id, th.toys[id].done);

		},

		every: function (th, id, frames) {
			if (toys._maketoy(th, id)) { th.toys[id].timer = 0; }
			th.toys[id].timer++;
			if (th.toys[id].timer == frames) {
				th.toys[id].timer = 0;
				return toys._toydone(th, id);
			} else {
				return toys._toybusy(th, id);
			}
		},

		after: function (th, id, frames) {
			if (toys._maketoy(th, id)) { th.toys[id].timer = 0; }
			if (th.toys[id].timer == frames) {
				return toys._toydone(th, id);
			} else {
				th.toys[id].timer++;
				return toys._toybusy(th, id);
			}
		}
	},

	// Logical helpers
	logic: {
		once: function (th, id, cond) {
			if (toys._maketoy(th, id)) { th.toys[id].done = false; }
			if (th.toys[id].done) {
				return false;
			} else {
				if (cond) {
					th.toys[id].done = true;
				}
			}
			return cond;
		}
	},

	// UI
	ui: {

		menu: function (th, id, opt) {
			if (toys._maketoy(th, id) || opt.resetmenu) {
				var fd = gbox.getFont(opt.font);
				th.toys[id].selected = (opt.selected ? opt.selected : 0);
				th.toys[id].ok = 0;
				var w = 0, i;
				for (i = 0; i < opt.items.length; i++) {
					if (opt.items[i].length > w) { w = opt.items[i].length; }
				}
				gbox.createCanvas("menu-" + id, {w: w * fd.tilew, h: opt.items.length * fd.tileh});
				for (i = 0; i < opt.items.length; i++) {
					gbox.blitText(gbox.getCanvasContext("menu-" + id), {font: opt.font, text: opt.items[i], dx: 0, dy: fd.tileh * i});
				}
				th.toys[id].fh = fd.tileh;
				th.toys[id].fw = fd.tilew;
			}
			if (!th.toys[id].ok) {
				if (AkihabaraInput.keyIsHit(opt.keys.up) && (th.toys[id].selected > 0)) {
					if (opt.audiooption) { AkihabaraAudio.hitAudio(opt.audiooption); }
					th.toys[id].selected--;
				} else {
					if (AkihabaraInput.keyIsHit(opt.keys.down) && (th.toys[id].selected < opt.items.length - 1)) {
						if (opt.audiooption) { AkihabaraAudio.hitAudio(opt.audiooption); }
						th.toys[id].selected++;
					} else {
						if (AkihabaraInput.keyIsHit(opt.keys.ok)) {
							if (opt.audioconfirm) { AkihabaraAudio.hitAudio(opt.audioconfirm); }
							th.toys[id].ok = 1;
						} else {
							if (AkihabaraInput.keyIsHit(opt.keys.cancel)) { th.toys[id].ok = -1; }
						}
					}
				}
			}
			gbox.blitAll(gbox.getBufferContext(), gbox.getCanvas("menu-" + id), {dx: opt.x + th.toys[id].fw, dy: opt.y, camera: opt.camera});
			if (!(th.toys[id].ok % 2)) {
				gbox.blitText(gbox.getBufferContext(), {font: opt.font, text: opt.selector, dx: opt.x, dy: opt.y + th.toys[id].selected * th.toys[id].fh, camera: opt.camera});
			}
			if (th.toys[id].ok) {
				if (th.toys[id].ok > 0) {
					if (th.toys[id].ok < 10) {
						th.toys[id].ok++;
						toys._toybusy(th, id);
					} else {
						return toys._toydone(th, id); // selected > 0
					}
				} else {
					return toys._toydone(th, id); // selected == -1
				}
			} else {
				return toys._toybusy(th, id);
			}
		},

		// Returns a full customizable object for optimized huds
		hud: function (id) {
			gbox.createCanvas(id);
			return {
				w: {},
				surfaceid: id,

				updateWidget: function (i) {
					if (!this.w[i].__hidden) {
						var ts;

						if (this.w[i].widget === "label") {
							if (this.w[i].prepad != null) {
								this.w[i].text = help.prepad(this.w[i].value, this.w[i].prepad, this.w[i].padwith);
							} else {
								if (this.w[i].postpad != null) {
									this.w[i].text = help.postpad(this.w[i].value, this.w[i].postpad, this.w[i].padwith);
								} else {
									this.w[i].text = this.w[i].value + "";
								}
							}
							gbox.blitText(gbox.getCanvasContext(this.surfaceid), this.w[i]);
						}

						if (this.w[i].widget === "symbols") {
							ts = gbox.getTiles(this.w[i].tileset);
							gbox.blitClear(gbox.getCanvasContext(this.surfaceid), {x: this.w[i].dx, y: this.w[i].dy, w: ((this.w[i].maxshown - 1) * this.w[i].gapx) + ts.tilew, h: ((this.w[i].maxshown - 1) * this.w[i].gapy) + ts.tileh});
							var cnt = this.w[i].value;
							for (var x = 0; x < this.w[i].maxshown; x++) {
								if (cnt > 0) {
									gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].tiles[(cnt > this.w[i].tiles.length ? this.w[i].tiles.length - 1:cnt - 1)], dx: this.w[i].dx + (x * this.w[i].gapx), dy: this.w[i].dy + (x * this.w[i].gapy), fliph: this.w[i].fliph, flipv: this.w[i].flipv});
								} else {
									if (this.w[i].emptytile != null) {
										gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].emptytile, dx: this.w[i].dx + (x * this.w[i].gapx), dy: this.w[i].dy + (x * this.w[i].gapy), fliph: this.w[i].fliph, flipv: this.w[i].flipv});
									}
								}
								cnt -= this.w[i].tiles.length;
							}
						}

						if (this.w[i].widget === "stack") {
							ts = gbox.getTiles(this.w[i].tileset);
							var bw = ((this.w[i].maxshown - 1) * this.w[i].gapx) + ts.tilew;
							gbox.blitClear(gbox.getCanvasContext(this.surfaceid), {x: this.w[i].dx - (this.w[i].rightalign ? bw : 0), y: this.w[i].dy, w: bw, h: ((this.w[i].maxshown - 1) * this.w[i].gapy) + ts.tileh});
							for (var x = 0; x < this.w[i].maxshown; x++) {
								if (x < this.w[i].value.length) {
									gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].value[x], dx: (this.w[i].rightalign ? this.w[i].dx - ts.tileh - (this.w[i].gapx * x) : this.w[i].dx + (x * this.w[i].gapx)), dy: this.w[i].dy + (x * this.w[i].gapy), fliph: this.w[i].fliph, flipv: this.w[i].flipv});
								}
							}
						}

						if (this.w[i].widget === "radio") {
							ts = gbox.getTiles(this.w[i].tileset);
							gbox.blitClear(gbox.getCanvasContext(this.surfaceid), {x: this.w[i].dx, y: this.w[i].dy, w: ts.tilew, h: ts.tileh});
							gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].frames[this.w[i].value], dx: this.w[i].dx, dy: this.w[i].dy, fliph: this.w[i].fliph, flipv: this.w[i].flipv});

						}

						if (this.w[i].widget === "blit") {
							ts = gbox.getTiles(this.w[i].tileset);
							gbox.blitClear(gbox.getCanvasContext(this.surfaceid), {x: this.w[i].dx, y: this.w[i].dy, w: ts.tilew, h: ts.tileh});
							gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].value, dx: this.w[i].dx, dy: this.w[i].dy, fliph: this.w[i].fliph, flipv: this.w[i].flipv});
						}

						if (this.w[i].widget === "bool") {
							ts = gbox.getTiles(this.w[i].tileset);
							gbox.blitClear(gbox.getCanvasContext(this.surfaceid), {x: this.w[i].dx, y: this.w[i].dy, w: ts.tilew, h: ts.tileh});
							if (this.w[i].value) {
								gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: this.w[i].frame, dx: this.w[i].dx, dy: this.w[i].dy, fliph: this.w[i].fliph, flipv: this.w[i].flipv});
							}
						}

						if (this.w[i].widget === "gauge") {
							ts = gbox.getTiles(this.w[i].tileset);
							gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: 0, dx: this.w[i].dx, dy: this.w[i].dy});
							gbox.blitTile(gbox.getCanvasContext(this.surfaceid), {tileset: this.w[i].tileset, tile: 1, dx: this.w[i].dx, dy: this.w[i].dy, w: (this.w[i].value * ts.tilew) / this.w[i].maxvalue});
						}
					}
				},

				hideWidgets: function (l) {
					for (var i = 0; i < l.length; i++) { this.w[l[i]].__hidden = true; }
					this.redraw();
				},

				showWidgets: function (l) {
					for (var i = 0; i < l.length; i++) { this.w[l[i]].__hidden = false; }
					this.redraw();
				},

				getValue: function (w, k) {
					return this.w[w][k];
				},

				getNumberValue: function (w, k) {
					return this.w[w][k] * 1;
				},

				setValue: function (w, k, v) {
					if (this.w[w][k] != v) {
						if (k == "value") {
							if ((this.w[w].maxvalue != null) && (v > this.w[w].maxvalue)) { v = this.w[w].maxvalue; }
							if ((this.w[w].minvalue != null) && (v < this.w[w].minvalue)) { v = this.w[w].minvalue; }
							if (this.w[w].widget == "radio") { v = (v % this.w[w].frames.length); }
						}
						this.w[w][k] = v;
						this.updateWidget(w);
					}
				},

				pushValue: function (w, k, v) {
					this.w[w][k].push(v);
					this.updateWidget(w);
				},

				addValue: function (w, k, v) {
					if (v) { this.setValue(w, k, this.w[w][k] + v); }
				},

				setWidget: function (id, w) {
					this.w[id] = w;
					this.updateWidget(id);
				},

				redraw: function () {
					gbox.blitClear(gbox.getCanvasContext(this.surfaceid));
					for (var i in this.w) { this.updateWidget(i); }
				},

				blit: function () {
					gbox.blitAll(gbox.getBufferContext(), gbox.getCanvas(this.surfaceid), {dx: 0, dy: 0});
				}
			};
		}
	},

	fullscreen: {

		fadeout: function (th, id, tox, data) {
			if (toys._maketoy(th, id) || data.resetfade) {
				th.toys[id].fade = 0;
				if (data.audiofade) { th.toys[id].stv = AkihabaraAudio.getAudioVolume(data.audiofade); }
				if (data.audiochannelfade) { th.toys[id].chv = AkihabaraAudio.getChannelVolume(data.audiochannelfade); }
			}
			th.toys[id].fade += data.fadespeed;
			if (th.toys[id].fade > 1) { th.toys[id].fade = 1; }
			data.alpha = th.toys[id].fade;
			gbox.blitFade(tox, data);
			if (data.audiofade) { AkihabaraAudio.setAudioVolume(data.audiofade, th.toys[id].stv * (1 - data.alpha)); }
			if (data.audiochannelfade) {
				if (data.alpha == 1) {
					AkihabaraAudio.stopChannel(data.audiochannelfade);
				} else {
					AkihabaraAudio.setChannelVolume(data.audiochannelfade, th.toys[id].chv * (1 - data.alpha));
				}
			}
			return toys._toyfrombool(th, id, th.toys[id].fade == 1);
		},

		fadein: function (th, id, tox, data) {
			if (toys._maketoy(th, id) || data.resetfade) {
				th.toys[id].fade = 1;
				if (data.audiofade) { th.toys[id].stv = AkihabaraAudio.getAudioVolume(data.audiofade); }
				if (data.audiochannelfade) { th.toys[id].chv = AkihabaraAudio.getChannelDefaultVolume(data.audiochannelfade); }
			}
			th.toys[id].fade -= data.fadespeed;
			if (th.toys[id].fade < 0) { th.toys[id].fade = 0; }
			if (th.toys[id].fade) {
				data.alpha = th.toys[id].fade;
				if (data.audiofade) { AkihabaraAudio.setAudioVolume(data.audiofade, th.toys[id].stv * (1 - data.alpha)); }
				if (data.audiochannelfade) { AkihabaraAudio.setChannelVolume(data.audiochannelfade, th.toys[id].chv * (1 - data.alpha)); }
				gbox.blitFade(tox, data);
			}
			return toys._toyfrombool(th, id, th.toys[id].fade == 0);
		}
	},

	text: {

		blink: function (th, id, tox, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].texttimer = 0;
				th.toys[id].visible = false;
				th.toys[id].times = 0;
			}
			if (th.toys[id].texttimer >= data.blinkspeed) {
				th.toys[id].texttimer = 0;
				th.toys[id].visible = !th.toys[id].visible;
				if (data.times) { th.toys[id].times++; }
			} else {
				th.toys[id].texttimer++;
			}
			if (th.toys[id].visible) {
				gbox.blitText(tox, data);
			}
			return toys._toyfrombool(th, id, (data.times ? data.times < th.toys[id].times : false));
		},

		fixed: function (th, id, tox, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].texttimer = 0;
			} else {
				th.toys[id].texttimer++;
			}
			gbox.blitText(tox, data);
			return toys._toyfrombool(th, id, data.time < th.toys[id].texttimer);
		}
	},

	logos: {

		linear: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].x = data.sx;
				th.toys[id].y = data.sy;
				th.toys[id].every = data.every;
				th.toys[id].played = false;
			}
			if (!th.toys[id].every) {
				if ((data.x != th.toys[id].x) || (data.y != th.toys[id].y)) {
					if ((Math.abs(data.x - th.toys[id].x) <= data.speed) && (Math.abs(data.y - th.toys[id].y) <= data.speed)) {
						th.toys[id].x = data.x;
						th.toys[id].y = data.y;
					} else {
						AkihabaraTrigo.translate(th.toys[id], AkihabaraTrigo.getAngle(th.toys[id], data), data.speed);
					}
				} else {
					if (!th.toys[id].played) {
						if (data.audioreach) { AkihabaraAudio.hitAudio(data.audioreach); }
						th.toys[id].played = true;
					}
				}
				th.toys[id].every = data.every;
			} else {
				th.toys[id].every--;
			}

			if (data.text) {
				gbox.blitText(gbox.getBufferContext(), {
					font: data.font,
					dx: th.toys[id].x,
					dy: th.toys[id].y,
					text: data.text
				});
			} else {
				if (data.tileset) {
					gbox.blitTile(gbox.getBufferContext(), {tileset: data.tileset, tile: data.tile, dx: th.toys[id].x, dy: th.toys[id].y, camera: data.camera, fliph: data.fliph, flipv: data.flipv, alpha: data.alpha});
				} else {
					gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: th.toys[id].x, dy: th.toys[id].y, alpha: data.alpha});
				}
			}
			return toys._toyfrombool(th, id, (data.x == th.toys[id].x) && (data.y == th.toys[id].y));
		},

		crossed: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].gapx = data.gapx;
				th.toys[id].lw = gbox.getImage(data.image).height;
				th.toys[id].done = false;
			}
			if (th.toys[id].gapx) {
				th.toys[id].gapx -= data.speed;
				if (th.toys[id].gapx < 0) { th.toys[id].gapx = 0; }
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x - th.toys[id].gapx, dy: data.y, alpha: data.alpha});
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x + th.toys[id].gapx, dy: data.y, alpha: data.alpha});
				return toys._toybusy(th, id);
			} else {
				if (!th.toys[id].done) {
					th.toys[id].done = true;
					if (data.audioreach) { AkihabaraAudio.hitAudio(data.audioreach); }
				}
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x, dy: data.y});
				return toys._toydone(th, id);
			}
		},

		zoomout: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].zoom = data.zoom;
				th.toys[id].done = false;
				th.toys[id].img = gbox.getImage(data.image);
			}
			if (th.toys[id].zoom != 1) {
				th.toys[id].zoom -= data.speed;
				if (th.toys[id].zoom <= 1) {
					th.toys[id].zoom = 1;
					if (data.audioreach) { AkihabaraAudio.hitAudio(data.audioreach); }
				}
				gbox.blit(gbox.getBufferContext(), gbox.getImage(data.image), {h: th.toys[id].img.height, w: th.toys[id].img.width, dx: data.x - Math.floor(th.toys[id].img.width * (th.toys[id].zoom - 1) / 2), dy: data.y - Math.floor(th.toys[id].img.height * (th.toys[id].zoom - 1) / 2), dh: Math.floor(th.toys[id].img.height * th.toys[id].zoom), dw: Math.floor(th.toys[id].img.width * th.toys[id].zoom), alpha: 1 / th.toys[id].zoom});
				return toys._toybusy(th, id);
			} else {
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x, dy: data.y});
				return toys._toydone(th, id);
			}
		},

		rising: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].cnt = 0;
				th.toys[id].lh = gbox.getImage(data.image).height;
				th.toys[id].lw = gbox.getImage(data.image).width;
				th.toys[id].done = false;
			}
			if (th.toys[id].cnt < th.toys[id].lh) {
				th.toys[id].cnt += data.speed;
				if (th.toys[id].cnt > th.toys[id].lh) { th.toys[id].gapx = th.toys[id].lh; }
				gbox.blit(gbox.getBufferContext(), gbox.getImage(data.image), {dh: th.toys[id].cnt, dw: th.toys[id].lw, dx: data.x, dy: data.y + th.toys[id].lh - th.toys[id].cnt, alpha: data.alpha});
				if (data.reflex) {
					gbox.blit(gbox.getBufferContext(), gbox.getImage(data.image), {dh: th.toys[id].cnt, dw: th.toys[id].lw, dx: data.x, dy: data.y + th.toys[id].lh, alpha: data.reflex, flipv: true});
				}
				if (th.toys[id].cnt >= th.toys[id].lh) {
					if (data.audioreach) { AkihabaraAudio.hitAudio(data.audioreach); }
				}
				return toys._toybusy(th, id);
			} else {
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x, dy: data.y});
				if (data.reflex) {
					gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x, dy: data.y + th.toys[id].lh, alpha: data.reflex, flipv: true});
				}

				return toys._toydone(th, id);
			}
		},

		bounce: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].accy = data.accy;
				th.toys[id].y = data.y;
				th.toys[id].h = gbox.getImage(data.image).height;
				th.toys[id].done = false;
			}
			if (!th.toys[id].done) {
				if (th.toys[id].y + th.toys[id].h >= data.floory) {
					if (data.audiobounce) { AkihabaraAudio.hitAudio(data.audiobounce); }
					th.toys[id].y = data.floory - th.toys[id].h;
					th.toys[id].accy = -Math.ceil(th.toys[id].accy / (data.heavy ? data.heavy : 2));
					th.toys[id].done = (th.toys[id].accy == 0);
				} else {
					th.toys[id].accy--;
				}
				th.toys[id].y -= th.toys[id].accy;
			}
			gbox.blitAll(gbox.getBufferContext(), gbox.getImage(data.image), {dx: data.x, dy: th.toys[id].y});

			return toys._toyfrombool(th, id, th.toys[id].done);
		}
	},

	dialogue: {

		render: function (th, id, data) {
			if (toys._maketoy(th, id)) {
				th.toys[id].newscene = true;
				th.toys[id].sceneid = -1;
				th.toys[id].ended = false;
				th.toys[id].timer = 0;
				th.toys[id].counter = 0;
				th.toys[id].anim = 0;
				gbox.createCanvas("dialogue-" + id);
			}

			if (!data.hideonend || (data.hideonend && !th.toys[id].ended)) {
				if (th.toys[id].newscene && !th.toys[id].ended) {
					th.toys[id].anim = 0;
					th.toys[id].timer = 0;
					th.toys[id].newscene = false;
					th.toys[id].sceneid++;
					th.toys[id].ended = (th.toys[id].sceneid == data.scenes.length);
					if (!th.toys[id].ended) {
						th.toys[id].letter = 0;
						th.toys[id].wait = false;
						th.toys[id].scene = data.scenes[th.toys[id].sceneid];
						th.toys[id].fd = gbox.getFont((th.toys[id].scene.font ? th.toys[id].scene.font : data.font));
						th.toys[id].sceneH = (th.toys[id].scene.dh ? th.toys[id].scene.dh : gbox.getScreenH());
						th.toys[id].sceneW = (th.toys[id].scene.dw ? th.toys[id].scene.dw : gbox.getScreenW());
						th.toys[id].sceneX = (th.toys[id].scene.dx ? th.toys[id].scene.dx : 0);
						th.toys[id].sceneY = (th.toys[id].scene.dy ? th.toys[id].scene.dy : 0);
						gbox.blitClear(gbox.getCanvasContext("dialogue-" + id));
						if (th.toys[id].scene.slide) {
							gbox.blitAll(gbox.getCanvasContext("dialogue-" + id), gbox.getImage(th.toys[id].scene.slide.image), {dx: th.toys[id].scene.slide.x, dy: th.toys[id].scene.slide.y});
						}
						if (th.toys[id].scene.scroller) {
							gbox.createCanvas("scroller-" + id, {w: th.toys[id].sceneW, h: (th.toys[id].scene.scroller.length) * (th.toys[id].fd.tileh + th.toys[id].scene.spacing)});
							for (var i = 0; i < th.toys[id].scene.scroller.length; i++) {
								gbox.blitText(gbox.getCanvasContext("scroller-" + id), {
									font: th.toys[id].fd.id,
									dx: 0,
									dy: i * (th.toys[id].fd.tileh + th.toys[id].scene.spacing),
									dw: th.toys[id].sceneW,
									halign: gbox.ALIGN_CENTER,
									text: th.toys[id].scene.scroller[i]
								});
							}
						}
						if (th.toys[id].scene.bonus) {
							gbox.createCanvas("bonus-" + id, {w: th.toys[id].sceneW, h: (th.toys[id].scene.bonus.length) * (th.toys[id].fd.tileh + th.toys[id].scene.spacing)});
						}
						if (th.toys[id].scene.audiomusic) { AkihabaraAudio.hitAudio(th.toys[id].scene.audiomusic); }
					}
				}
				if (!th.toys[id].ended) {
					if (th.toys[id].wait) {
						if (AkihabaraInput.keyIsHit(data.esckey)) {
							th.toys[id].ended = true;
						} else {
							if (AkihabaraInput.keyIsHit(data.skipkey)) {
								th.toys[id].newscene = true;
							}
						}
					} else {
						// SKIP KEYS

						if (AkihabaraInput.keyIsHit(data.esckey)) {
							th.toys[id].ended = true;
						} else {
							if (AkihabaraInput.keyIsHold(data.skipkey)) {
								th.toys[id].counter = th.toys[id].scene.speed;
							} else {
								th.toys[id].counter++;
							}
						}

						// MOVING

						if (th.toys[id].scene.talk) { // DIALOGUES
							if (th.toys[id].counter == th.toys[id].scene.speed) {
								th.toys[id].letter++;
								th.toys[id].counter = 0;
								if (th.toys[id].scene.audio && !(th.toys[id].letter % 3)) { AkihabaraAudio.hitAudio(th.toys[id].scene.audio); }
								var tmp = th.toys[id].letter;
								var row = 0;
								while (tmp > th.toys[id].scene.talk[row].length) {
									tmp -= th.toys[id].scene.talk[row].length;
									row++;
									if (row == th.toys[id].scene.talk.length) {
										row = -1;
										break;
									}
								}
								if (row >= 0) {
									gbox.blitText(gbox.getCanvasContext("dialogue-" + id), {
										font: data.font,
										dx: data.who[th.toys[id].scene.who].x,
										dy: (data.who[th.toys[id].scene.who].y) + (row * th.toys[id].fd.tileh),
										text: th.toys[id].scene.talk[row].substr(0, tmp)
									});
								} else {
									th.toys[id].wait = true;
								}
							}
						} else if (th.toys[id].scene.scroller) { // SCROLLER (i.e. credits)

							if (th.toys[id].counter == th.toys[id].scene.speed) {
								th.toys[id].letter++;
								th.toys[id].counter = 0;
								if (th.toys[id].letter == (gbox.getCanvas("scroller-" + id).height + th.toys[id].scene.push)) {
									th.toys[id].wait = true;
								}
							}

						} else if (th.toys[id].scene.bonus) { // BONUS (classic bonus award screen)
							for (var row = 0; row <= th.toys[id].letter; row++) {
								if (th.toys[id].scene.bonus[row].text) {
									gbox.blitText(gbox.getCanvasContext("bonus-" + id), {
										font: data.font,
										dx: 0,
										dy: (row * (th.toys[id].fd.tileh + th.toys[id].scene.spacing)),
										text: th.toys[id].scene.bonus[row].text
									});
								} else if (th.toys[id].scene.bonus[row].mul) {
									// Mask is %VAL%e%MUL% = %TOT%
									th.toys[id].scene.bonus[row].tmptext = th.toys[id].scene.bonus[row].mask.replace(/%VAL%/, th.toys[id].timer).replace(/%MUL%/, th.toys[id].scene.bonus[row].mul).replace(/%TOT%/, (th.toys[id].timer * th.toys[id].scene.bonus[row].mul));
									gbox.blitText(gbox.getCanvasContext("bonus-" + id), {
										clear: true,
										font: data.font,
										dx: 0,
										dy: (row * (th.toys[id].fd.tileh + th.toys[id].scene.spacing)),
										text: th.toys[id].scene.bonus[row].tmptext
									});
								}
							}

							if (!th.toys[id].wait) {
								var next = false;
								if (th.toys[id].scene.bonus[th.toys[id].letter].mul && !th.toys[id].scene.bonus[th.toys[id].letter].text) {
									if (th.toys[id].counter >= th.toys[id].scene.bonus[th.toys[id].letter].speed) {
										th.toys[id].counter = 0;
										th.toys[id].timer++;
										if (th.toys[id].timer > th.toys[id].scene.bonus[th.toys[id].letter].mulvalue) {
											th.toys[id].scene.bonus[th.toys[id].letter].text = th.toys[id].scene.bonus[th.toys[id].letter].tmptext;
											next = true;
										} else {
											if (th.toys[id].scene.bonus[th.toys[id].letter].callback) {
												th.toys[id].scene.bonus[th.toys[id].letter].callback(th.toys[id].scene.bonus[th.toys[id].letter], th.toys[id].scene.bonus[th.toys[id].letter].arg);
											}
										}
									}

								} else if (th.toys[id].counter >= th.toys[id].scene.speed) { next = true; }

								if (next) {
									if (th.toys[id].letter == th.toys[id].scene.bonus.length - 1) {
										th.toys[id].wait = true;
									} else {
										th.toys[id].letter++;
										if (th.toys[id].scene.bonus[th.toys[id].letter].mul) {
											th.toys[id].scene.bonus[th.toys[id].letter].text = null;
											th.toys[id].scene.bonus[th.toys[id].letter].tmptext = null;
											th.toys[id].timer = 0;
										}
										th.toys[id].counter = 0;
									}
								}
							}
						}
					}
				}

				// RENDERING

				if (th.toys[id].scene.talk) { // DIALOGUES
					if (data.who[th.toys[id].scene.who].box) {
						gbox.blitRect(gbox.getBufferContext(), data.who[th.toys[id].scene.who].box);
					}
					if (data.who[th.toys[id].scene.who].tileset) {
						th.toys[id].anim = (th.toys[id].anim + 1) % 20;
						gbox.blitTile(gbox.getBufferContext(), {tileset: data.who[th.toys[id].scene.who].tileset, tile: help.decideFrame(th.toys[id].anim, data.who[th.toys[id].scene.who].frames), dx: data.who[th.toys[id].scene.who].portraitx, dy: data.who[th.toys[id].scene.who].portraity, camera: false, fliph: data.who[th.toys[id].scene.who].fliph, flipv: data.who[th.toys[id].scene.who].flipv});
					}
					gbox.blitAll(gbox.getBufferContext(), gbox.getCanvas("dialogue-" + id), {dx: 0, dy: 0});
				} else if (th.toys[id].scene.scroller) { // SCROLLER (i.e. credits)
					gbox.blit(gbox.getBufferContext(), gbox.getCanvas("scroller-" + id), {dx: th.toys[id].sceneX, dy: th.toys[id].sceneY + (th.toys[id].letter < th.toys[id].sceneH ? th.toys[id].sceneH - th.toys[id].letter : 0), dw: th.toys[id].sceneW, y: (th.toys[id].letter < th.toys[id].sceneH ? 0:th.toys[id].letter - th.toys[id].sceneH), dh: (th.toys[id].letter < th.toys[id].sceneH ? th.toys[id].letter : th.toys[id].sceneH)});
				} else if (th.toys[id].scene.bonus) { // BONUS (i.e. credits)
					gbox.blitAll(gbox.getBufferContext(), gbox.getCanvas("bonus-" + id), {dx: th.toys[id].sceneX, dy: th.toys[id].sceneY});
				}
			}
			return toys._toyfrombool(th, id, th.toys[id].ended);
		}
	},

	// GENERATORS


	generate: {

		sparks: {
			simple: function (th, group, id, data) {
				var ts = gbox.getTiles(data.tileset);
				if (data.frames == null) {
					data.frames = { speed: (data.animspeed == null ? 1 : data.animspeed), frames: []};
					for (var i = 0; i < ts.tilerow; i++) { data.frames.frames[i] = i; }
				}

				var obj = gbox.addObject(
					Akihabara.extendsFrom({
						id: id,
						group: group,
						x: th.x + th.hw - ts.tilehw + (data.gapx == null ? 0 : data.gapx),
						y: (data.valign === "top" ? th.y: th.y + th.hh - ts.tilehh + (data.gapy == null ? 0 : data.gapy)),
						tileset: data.tileset,
						alpha: null,
						accx: 0,
						accy: 0,
						frame: 0,
						timer: (data.delay ? -data.delay : -1),
						frames: data.frames,
						toptimer: ((data.frames.frames.length) * data.frames.speed) - 1,
						camera: th.camera,
						gravity: false,
						trashoffscreen: true,
						fliph: (data.fliph == null ? th.fliph : data.fliph),
						flipv: (data.flipv == null ? th.flipv : data.flipv),
						blinkspeed: 0
					}, data)
				);

				obj[(data.logicon == null ? "first":data.logicon)] = function () {
					this.timer++;
					if (this.timer >= 0) {
						this.x += this.accx;
						this.y += this.accy;
						if (this.gravity) { this.accy++; }
						if ((this.timer == this.toptimer) || (this.trashoffscreen && (!gbox.objectIsVisible(this)))) {
							gbox.trashObject(this);
						}
					}
				};

				obj[(data.bliton == null ? "blit":data.bliton)] = function () {
					if ((this.timer >= 0) && (!this.blinkspeed || (Math.floor(this.timer / this.blinkspeed) % 2))) {
						gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.timer, this.frames), dx: this.x, dy: this.y, camera: this.camera, fliph: this.fliph, flipv: this.flipv, alpha: this.alpha});
					}
				};

				return obj;
			},

			popupText: function (th, group, id, data) {
				data.text += "";
				var fd = gbox.getFont(data.font);

				var obj = gbox.addObject(
					Akihabara.extendsFrom({
						id: id,
						group: group,
						x: Math.floor(th.x + th.hw - (fd.tilehw * data.text.length)),
						y: th.y - fd.tilehh,
						vaccy: -data.jump,
						font: "small",
						keep: 0,
						text: data.text + "",
						cnt: 0,
						camera: th.camera
					}, data)
				);

				obj.initialize = function () {
					var fd = gbox.getFont(this.font);
					gbox.createCanvas("poptext-" + this.id, {w: this.text.length * fd.tilew, h: fd.tileh});
					gbox.blitText(gbox.getCanvasContext("poptext-" + this.id), {font: this.font, text: this.text, dx: 0, dy: 0});
				};

				obj.onpurge = function () {
					gbox.deleteCanvas("poptext-" + this.id);
				};

				obj[(data.logicon == null ? "first":data.logicon)] = function () {
					if (gbox.objectIsVisible(this)) {
						if (this.vaccy) {
							this.vaccy++;
						} else {
							this.cnt++;
						}
						this.y += this.vaccy;
						if (this.cnt >= this.keep) { gbox.trashObject(this); }
					} else {
						gbox.trashObject(this);
					}
				};

				obj[(data.bliton == null ? "blit":data.bliton)] = function () {
					gbox.blitAll(gbox.getBufferContext(), gbox.getCanvas("poptext-" + this.id), {dx: this.x, dy: this.y, camera: this.camera});
				};

				return obj;
			},

			bounceDie: function (th, group, id, data) {
				var obj = gbox.addObject(
					Akihabara.extendsFrom({
						id: id,
						group: group,
						tileset: th.tileset,
						frame: th.frame,
						side: th.side,
						frames: th.frames.die,
						x: th.x,
						y: th.y,
						vaccy: -data.jump,
						accx: 0,
						flipv: data.flipv,
						cnt: 0,
						blinkspeed: 0,
						camera: th.camera
					}, data)
				);

				obj[(data.logicon == null ? "first":data.logicon)] = function () {
					if (gbox.objectIsVisible(this)) {
						this.vaccy++;
						this.y += this.vaccy;
						this.x += this.accx;
						this.cnt++;
					} else {
						gbox.trashObject(this);
					}
				};

				obj[(data.bliton == null ? "blit":data.bliton)] = function () {
					if (!this.blinkspeed || (Math.floor(this.cnt / this.blinkspeed) % 2)) {
						gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.cnt, this.frames), dx: this.x, dy: this.y, camera: this.camera, fliph: this.side, flipv: this.flipv});
					}
				};

				return obj;
			}
		}
	}
};
