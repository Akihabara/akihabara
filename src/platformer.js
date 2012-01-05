/**
* @namespace platformer The libraries for generating a 2D platformer game.
*/
var platformer={
	// CONSTANTS
	PUSH_NONE:0,
	PUSH_LEFT:1,
	PUSH_RIGHT:2,

	initialize:function(th,data) {
		help.mergeWithModel(
			th,
			help.mergeWithModel(
				data,
				{
					maxaccx:5, maxaccy:10,
					jumpsize:6, jumpaccy:6,
					accx:0, accy:0,
					x:0, y:0,
					frames:{},
					camera:true,
					flipv:false,
					side:false
				}
			)
		);
		platformer.spawn(th);
	},

	spawn:function(th,data) {
		th.curjsize=0; // current jump size
		th.counter=0; // self counter
		th.touchedfloor=false; // touched floor
		th.touchedceil=false;
		th.touchedleftwall=false;
		th.touchedrightwall=false;
		th.pushing=platformer.PUSH_NONE; // user is moving side
		th.killed=false;
		help.copyModel(th,data);
	},

	getNextX:function(th) { return th.x+th.accx; },

	getNextY:function(th) { return th.y+help.limit(th.accy,-th.maxaccy,th.maxaccy); },

	applyGravity:function(th) {
		th.x=platformer.getNextX(th);
		th.y=platformer.getNextY(th);
	},

	horizontalKeys:function(th,keys) {
		if (gbox.keyIsPressed(keys.left)) {
			th.pushing=platformer.PUSH_LEFT;
			th.accx=help.limit(th.accx-1,-th.maxaccx,th.maxaccx);
		} else if (gbox.keyIsPressed(keys.right)) {
			th.pushing=platformer.PUSH_RIGHT;
			th.accx=help.limit(th.accx+1,-th.maxaccx,th.maxaccx);
		} else th.pushing=platformer.PUSH_NONE;
	},

	verticalTileCollision:function(th,map,tilemap) {
		var bottom=help.getTileInMap(th.x+(th.w/2),th.y+th.h,map,0,tilemap);
		var top=help.getTileInMap(th.x+(th.w/2),th.y,map,0,tilemap);
		th.touchedfloor=false;
		th.touchedceil=false;

		if (map.tileIsSolidCeil(th,top)) {
			th.accy=0;
			th.y=help.yPixelToTile(map,th.y,1);
			th.touchedceil=true;
		}
		if (map.tileIsSolidFloor(th,bottom)) {
			th.accy=0;
			th.y=help.yPixelToTile(map,th.y+th.h)-th.h;
			th.touchedfloor=true;
		}
	},

	horizontalTileCollision:function(th,map,tilemap,precision) {
		var left=0;
		var right=0;
		var t=0;

		th.touchedleftwall=false;
		th.touchedrightwall=false;

		while (t<th.h) {
			left=help.getTileInMap(th.x,th.y+t,map,0,tilemap);
			right=help.getTileInMap(th.x+th.w-1,th.y+t,map,0,tilemap);

			if ((th.accx<0)&&map.tileIsSolidFloor(th,left)) {
				th.accx=0;
				th.x=help.xPixelToTile(map,th.x-1,1);
				th.touchedleftwall=true;
			}
			if ((th.accx>0)&&map.tileIsSolidFloor(th,right)) {
				th.accx=0;
				th.x=help.xPixelToTile(map,th.x+th.w)-th.w;
				th.touchedrightwall=true;
			}
			t+=gbox.getTiles(map.tileset).tileh/(precision?precision:1);
		}
	},

	/**
	* Checks if the passed object is touching the floor and can therefore jump at present.
	* @param th This is the object being checked for jump ability at the time of calling.
	*/
	canJump:function(th) {
		return th.touchedfloor;
	},

	jumpKeys:function(th,key) {
		if ((platformer.canJump(th)||(key.doublejump&&(th.accy>=0)))&&gbox.keyIsHit(key.jump)&&(th.curjsize==0)) {
			if (key.audiojump) audio.hitAudio(key.audiojump);
			th.accy=-th.jumpaccy;
			th.curjsize=th.jumpsize;
			return true;
		} else if (th.curjsize&&gbox.keyIsHold(key.jump)) { // Jump modulation
			th.accy--;
			th.curjsize--;
		} else
			th.curjsize=0;
		return false;
	},

	bounce:function(th,data) {
		th.curjsize=0;
		th.accy=-data.jumpsize;
	},

	handleAccellerations:function(th) {
		// Gravity
		if (!th.touchedfloor) th.accy++;
		// Attrito
		if (th.pushing==platformer.PUSH_NONE) if (th.accx) th.accx=help.goToZero(th.accx);
	},

	setSide:function(th) {
		if (th.accx) th.side=th.accx>0;
	},

	setFrame:function(th) {
		if (th.touchedfloor)
			if (th.pushing!=platformer.PUSH_NONE)
				th.frame=help.decideFrame(th.counter,th.frames.walking);
			else
				th.frame=help.decideFrame(th.counter,th.frames.still);
		else if (th.accy>0)
			th.frame=help.decideFrame(th.counter,th.frames.falling);
		else
			th.frame=help.decideFrame(th.counter,th.frames.jumping);
	},

	auto:{
		// Moves on a platform. It tries to do not fall down, if specified.
		// Args: (object,{moveWhileFalling:<moves while not touching the floor>,speed:<movement speed>})
		// Outs: the frame
		goomba:function(th,data) {
			if (data.moveWhileFalling||th.touchedfloor) {
				if (th.side) {
					th.pushing=platformer.PUSH_LEFT;
					th.accx=-data.speed;
				} else {
					th.pushing=platformer.PUSH_RIGHT;
					th.accx=data.speed;
				}
			} else th.pushing=platformer.PUSH_NONE;
		},
		dontFall:function(th,map,tilemap) {
			if (th.accx&&th.touchedfloor) {
				var til;
				if (th.accx>0) til=help.getTileInMap(platformer.getNextX(th)+th.w-1+th.accx,th.y+th.h,map,0,tilemap);
				else til=help.getTileInMap(platformer.getNextX(th),th.y+th.h,map,0,tilemap);
				if (!map.tileIsSolidFloor(th,til)) {
					th.side=!th.side;
					th.accx=0;
				}
			}
		},
		horizontalBounce:function(th) {
			if (th.touchedleftwall||th.touchedrightwall) th.side=!th.side;
		}
	}
}
