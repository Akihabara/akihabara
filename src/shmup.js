/**
 * @namespace shmup The libraries for a 2D top-down Shmup game.
 */
// Shoot'em up specifics
var shmup = {

	// CONSTANTS
	NOOP: function(){ },
	PUSH_NONE: 0,
	PUSH_LEFT: 1,
	PUSH_RIGHT: 2,
	PUSH_UP: 3,
	PUSH_DOWN: 4,

	initialize: function(th, data) {
		help.mergeWithModel(
			th,
			help.mergeWithModel(
				data,
				{
					x: 0, y: 0,
					accx: 0, accy: 0,
					frames: {},
					maxacc: 5, controlmaxacc: 5,
					responsive: 0, // Responsiveness
					bounds: {x: 0, y: 0, w: gbox.getScreenW(), h: gbox.getScreenH()}, // Bounds box (ship cannot exit from there)
					weapon: 0, // Weapon
					hittime: 5,
					camera: false,
					flipv: false, fliph: false,
					health: 1,
					tolerance: 4
				}
			)
		);
		shmup.spawn(th);
	},

	spawn: function(th, data) {
		th.xpushing = shmup.PUSH_NONE; // user is moving side
		th.vpushing = shmup.PUSH_NONE; // user is moving side
		th.counter = 0; // self counter
		th.hittimer = 0;
		th.killed = false;
		help.copyModel(th, data);
	},

	getNextX: function(th) { return th.x + help.limit(th.accx, -th.maxacc, th.maxacc); },
	getNextY: function(th) { return th.y + help.limit(th.accy, -th.maxacc, th.maxacc); },
	controlKeys: function(th, keys) {

		if (gbox.keyIsPressed(keys.left)) {
			th.xpushing = shmup.PUSH_LEFT;
			if (th.accx > th.responsive) th.accx = th.responsive;
			th.accx = help.limit(th.accx-1, -th.controlmaxacc, th.controlmaxacc);
		} else if (gbox.keyIsPressed(keys.right)) {
			th.xpushing = shmup.PUSH_RIGHT;
			if (th.accx < -th.responsive) th.accx = -th.responsive;
			th.accx = help.limit(th.accx + 1, -th.controlmaxacc, th.controlmaxacc);
		} else th.xpushing = shmup.PUSH_NONE;
		if (gbox.keyIsPressed(keys.up)) {
			th.ypushing = shmup.PUSH_UP;
			if (th.accy > th.responsive) th.accy = th.responsive;
			th.accy = help.limit(th.accy-1, -th.controlmaxacc, th.controlmaxacc);
		} else if (gbox.keyIsPressed(keys.down)) {
			th.ypushing = shmup.PUSH_DOWN;
			if (th.accy < -th.responsive) th.accy = -th.responsive;
			th.accy = help.limit(th.accy + 1, -th.controlmaxacc, th.controlmaxacc);
		} else th.ypushing = shmup.PUSH_NONE;
	},

	applyForces: function(th) {
		th.x = shmup.getNextX(th);
		th.y = shmup.getNextY(th);
	},

	handleAccellerations: function(th) {
		if (!th.xpushing) th.accx = help.goToZero(th.accx);
		if (!th.ypushing) th.accy = help.goToZero(th.accy);
	},

	keepInBounds: function(th) {
		if (th.x < th.bounds.x) {
			th.x = th.bounds.x;
			th.accx = 0;
		} else if (th.x + th.w > th.bounds.x + th.bounds.w) {
			th.x = th.bounds.x + th.bounds.w-th.w;
			th.accx = 0;
		}
		if (th.y < th.bounds.y) {
			th.y = th.bounds.y;
			th.accy = 0;
		} else if (th.y + th.h > th.bounds.y + th.bounds.h) {
			th.y = th.bounds.y + th.bounds.h-th.h;
			th.accy = 0;
		}
	},

	setFrame: function(th) {
		if (th.hittimer) th.hittimer--;
		th.frame = help.decideFrame(th.counter, (th.hittimer?th.frames.hit: th.frames.still));
	},

	fireBullet: function(gr, id, data) {
		var ts = gbox.getTiles(data.tileset);
		var obj = gbox.addObject(
			help.mergeWithModel(
				data, {
					_bullet: true,
					fliph: false, flipv: false,
					id: id,
					group: gr,
					cnt: 0,
					tileset: "",
					frames: {},
					acc: 0,
					angle: 0,
					camera: false,
					accx: (data.accx == null?Math.floor(trigo.translateX(0, data.angle, data.acc)):0),
					accy: (data.accy == null?Math.floor(trigo.translateY(0, data.angle, data.acc)):0),
					x: data.from.x + data.from.hw-ts.tilehw + (data.gapx?data.gapx: 0),
					y: (data.upper?data.from.y-ts.tilehh + (data.gapy?data.gapy: 0):data.from.y + data.from.h-ts.tilehh-(data.gapy?data.gapy: 0)),
					collidegroup: "",
					spark: shmup.NOOP,
					power: 1
				}
			)
		);

		obj[(data.logicon == null?"first":data.logicon)] = function() {
			this.x += this.accx;
			this.y += this.accy;
			this.cnt = (this.cnt + 1)%10;
			if (!gbox.objectIsVisible(this)) gbox.trashObject(this);
			else if (this.collidegroup != null)
				for (var i in gbox._objects[this.collidegroup])
					if ((!gbox._objects[this.collidegroup][i].initialize) && gbox.collides(this, gbox._objects[this.collidegroup][i], gbox._objects[this.collidegroup][i].tolerance)) {
						if (gbox._objects[this.collidegroup][i].hitByBullet != null)
							if (!gbox._objects[this.collidegroup][i].hitByBullet(this)) {
								this.spark(this);
								gbox.trashObject(this);
							}
					}
		};

		obj[(data.bliton == null?"blit":data.bliton)] = function() {
			gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.cnt, this.frames), dx: this.x, dy: this.y, camera: this.camera, fliph: this.side, flipv: this.flipv});
		};

		return obj;

	},

	hitByBullet: function(th, by) {
		if (by.power) {
			th.health-=by.power;
			if (th.health <= 0) th.kill(by); else  th.hittimer = th.hittime;
		}
	},

	generateEnemy: function(gr, id, data, model) {
		help.mergeWithModel(data, model);
		var obj = gbox.addObject(
			help.mergeWithModel(
				data, {
					id: id,
					group: gr,
					cnt: 0,
					tileset: "",
					frames: {},
					acc: 0,
					angle: 0,
					camera: false,
					fliph: false,
					flipv: false,
					accx: (data.accx == null?Math.floor(trigo.translateX(0, data.angle, data.acc)):0),
					accy: (data.accy == null?Math.floor(trigo.translateY(0, data.angle, data.acc)):0),
					x: data.x,
					y: data.y,
					// -- spec
					animationset: "still",
					defaultanimationset: "still",
					hitanimationset: "still",
					hittime: 5,
					script: shmup.NOOP,
					handler: shmup.NOOP,
					scriptline: (data.scriptline == null?-1:data.scriptline-1),
					newline: true,
					waitframes: 0,
					doframes: 0,
					mode: 0,
					line: {},
					dohandler: null,
					ended: false,
					health: 1,
					hittimer: 0,
					kill: shmup.NOOP,
					tolerance: 0,
					initialize: null,
					invulnerable: false,
					hitAnimation: function(time) {
						this.hittimer = (time == null?this.hittime: time);
						this.animationset = this.hitanimationset;
					},
					goTo: function(nl) { // Jump to a line
						this.waitframes = 0;
						this.doframes = 0;
						this.line = {};
						this.scriptline = nl-1;
					},
					hitByBullet: function(by) {
						if (!this.invulnerable && by.power) {
							this.health-=by.power;
							if (this.health <= 0) this.kill(this, by); else this.hitAnimation();
						}
					}
				}
			)
		);


		obj[(data.logicon == null?"first":data.logicon)] = function() {
			if (this.initialize != null)  {
				this.initialize(this);
				this.initialize = null;
			}
			if (!this.ended) {
				if (!this.waitframes && !this.doframes && ((this.line.waitfor == null) || this.line.waitfor(this))) {
					this.scriptline++;
					this.everycnt = -1;
					if (this.script[this.scriptline] == null)
						this.ended = true;
					else {
						if (this.script[this.scriptline]["goto"] != null) this.scriptline = this.script[this.scriptline]["goto"];
						this.line = this.script[this.scriptline];
						if (this.line.afterframes != null)
							this.waitframes = this.line.afterframes;
						if (this.line.forframes != null)
							this.doframes = this.line.forframes;
						else
							this.doframes = 1;
						if (this.line.cleardo)
							this.dohandler = null;
						else if (this.line.doit != null) {
							this.dohandler = {
								actiontimes: 0,
								timer: (this.line.doit.every == "keep"?this.dohandler.every: this.line.doit.every),
								every: (this.line.doit.every == "keep"?this.dohandler.every: this.line.doit.every),
								once: (this.line.doit.once == "keep"?this.dohandler.once: this.line.doit.once),
								action: (this.line.doit.action == "keep"?this.dohandler.action: this.line.doit.action),
								render: (this.line.doit.render == "keep"?this.dohandler.render: this.line.doit.render)
							};
						}
					}
				}
				if (!this.waitframes && this.doframes && !this.ended) {
					this.doframes--;
					if (this.line.setinvulnerable != null) this.invulnerable = this.line.setinvulnerable;
					if (this.line.setx != null) this.x = this.line.setx;
					if (this.line.sety != null) this.y = this.line.sety;
					if (this.line.addx != null) this.x += this.line.addx;
					if (this.line.addy != null) this.y += this.line.addy;
					if (this.line.setaccx != null) this.accx = this.line.setaccx;
					if (this.line.setaccy != null) this.accy = this.line.setaccy;
					if (this.line.setacc != null) {
						this.acc = this.line.setacc;
						this.accx = Math.floor(trigo.translateX(0, this.angle, this.acc));
						this.accy = Math.floor(trigo.translateY(0, this.angle, this.acc));
					}
					if (this.line.addaccx != null) this.accx += this.line.addaccx;
					if (this.line.addaccy != null) this.accy += this.line.addaccy;
					if (this.line.addacc != null) {
						this.acc += this.line.addacc;
						this.accx = Math.floor(trigo.translateX(0, this.angle, this.acc));
						this.accy = Math.floor(trigo.translateY(0, this.angle, this.acc));
					}

					if (this.line.setangle != null) {
						this.angle = this.line.setangle;
						this.accx = Math.floor(trigo.translateX(0, this.angle, this.acc));
						this.accy = Math.floor(trigo.translateY(0, this.angle, this.acc));
					}
					if (this.line.addangle != null) {
						this.angle += this.line.addangle;
						this.accx = Math.floor(trigo.translateX(0, this.angle, this.acc));
						this.accy = Math.floor(trigo.translateY(0, this.angle, this.acc));
					}
					if (this.line.everyframe) this.waitframes = this.line.everyframe;

				}
				if (this.waitframes > 0) this.waitframes--;
			}
			if (this.dohandler && (this.dohandler.action != null)) {
				if (this.dohandler.timer == this.dohandler.every) {
					this.dohandler.action(this, this.dohandler.actiontimes);
					this.dohandler.timer = 0;
					this.dohandler.actiontimes++;
				} else if (!this.dohandler.once) this.dohandler.timer++;
			}
			if (this.handler != null) this.handler(this);

			if (this.hittimer) {
				this.hittimer--;
				if (!this.hittimer) this.animationset = this.defaultanimationset;
			}

			this.x += this.accx;
			this.y += this.accy;
			this.cnt = (this.cnt + 1)%10;

		};

		obj[(data.bliton == null?"blit":data.bliton)] = function() {
			gbox.blitTile(gbox.getBufferContext(), {tileset: this.tileset, tile: help.decideFrame(this.cnt, this.frames[this.animationset]), dx: this.x, dy: this.y, camera: this.camera, fliph: this.side, flipv: this.flipv});
			if (this.dohandler && (this.dohandler.render != null)) this.dohandler.render(this);
		};

		return obj;

	},

	generateScroller: function(gr, id, data) {
		var obj = gbox.addObject(
			help.mergeWithModel(
				help.cloneObject(data), {
					id: id, group: gr,
					y: 0, x: 0,
					stage: {},
					speed: 0,
					stop: null, // Remember to set the last stop ever! or the last loop!
					block: -1,
					bly: 0,
					lblock: -1,
					lbly: 0,
					lget: 0,
					tbly: 0,
					trb: 0,
					maxwidth: 0,
					loopstart: null, loopend: null, looprounds: 0,
					panspeed: 1, panstimer: 0, destspeed: 0,

					setLoop: function(st, en) {
						this.loopstart = st;
						this.loopend = en;
						this.lget = 1;
						this.looprounds = 1;
					},

					quitLoop: function() {
						this.setLoop(null, null);
						this.looprounds = 0;
					},

					setSpeed: function(s) {
						this.speed = s;
						this.destspeed = s;
					},

					panToSpeed: function(s, pans) {
						this.destspeed = s;
						this.panspeed = pans;
					},

					quitStop: function() {
						this.stop = null;
					},

					setStop: function(s) {
						this.stop = s;
					},

					setX: function(x) {
						if (x < 0) this.x = 0; else
						if (x + gbox.getScreenW() > this.maxwidth) this.x = this.maxwidth-gbox.getScreenW();
						else this.x = x;
					}

				}
			)
		);

		obj[(data.logicon == null?"first":data.logicon)] = function() {
			if ((this.stop == null) || (this.y < this.stop)) {
				if (this.speed != this.destspeed) {
					if (this.panstimer) {
						this.panstimer--;
					} else {
						if (this.speed < this.destspeed) this.speed++; else
						if (this.speed > this.destspeed) this.speed--;
						this.panstimer = this.panspeed;
					}
				}
				this.y += this.speed;
				if ((this.stop != null) && (this.y >= this.stop)) this.y = this.stop;
				if ((this.loopend != null) && (this.y > this.loopend)) {
					this.y = this.loopstart + (this.y-this.loopend);
					this.looprounds++;
					if (this.lget == 1) {
						this.block = 0;
						this.bly = 0;
						this.lget = 2;
					} else {
						this.block = this.lblock;
						this.bly = this.lbly;
					}

				}
			}

			this.trb = this.block;
			this.tbly = this.bly;
			do {
				this.trb++;
				this.tbly += gbox.getImage(this.stage[this.trb].image).height;
			} while (this.tbly < this.y);

			this.block = this.trb-1;
			this.bly = this.tbly-gbox.getImage(this.stage[this.trb].image).height;

			if (this.lget == 2) {
				this.lblock = this.block;
				this.lbly = this.bly;
				this.lget = 3;
			}
		};

		obj[(data.bliton == null?"blit":data.bliton)] = function() {
			var dy = this.tbly-this.y;
			var done = false;
			do {
				if (dy > gbox.getScreenH()) done = true;
				gbox.blitAll(gbox.getBufferContext(), gbox.getImage(this.stage[this.trb].image), {dx: -this.x, dy: gbox.getScreenH()-dy});
				this.trb++;
				dy += gbox.getImage(this.stage[this.trb].image).height;
			} while (!done);
		};

		return obj;
	}
};
