import { Player, Bullet } from './models';

const mazeM = JSON.parse("[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,-1,1,1,1,1,1,-1,-1],[-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,1,-1,1,-1,-1],[-1,1,0,1,0,1,0,1,0,1,-1,1,1,1,1,1,-1,1,-1,-1],[-1,0,0,0,0,0,0,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,0,1,0,1,0,1,0,1,-1,1,0,1,0,1,0,1,-1,-1],[-1,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,-1,-1],[-1,1,0,1,0,1,0,1,0,1,-1,1,0,1,0,1,0,1,-1,-1],[-1,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,-1,-1],[-1,1,0,1,0,1,0,1,0,1,-1,1,0,1,0,1,0,1,-1,-1],[-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,1,1,1,1,-1,1,-1,1,0,1,-1,1,1,1,1,1,-1,-1],[-1,-1,-1,-1,-1,1,-1,1,-1,0,0,0,-1,1,-1,-1,-1,-1,-1,-1],[-1,1,1,1,-1,1,1,1,-1,1,0,1,-1,1,-1,1,0,1,-1,-1],[-1,1,-1,1,-1,-1,-1,1,-1,-1,-1,-1,-1,1,-1,0,0,0,-1,-1],[-1,1,-1,1,1,1,-1,1,-1,1,1,1,-1,1,-1,1,0,1,-1,-1],[-1,1,-1,-1,-1,1,-1,1,-1,1,-1,1,-1,1,-1,0,0,0,-1,-1],[-1,1,1,1,-1,1,1,1,1,1,-1,1,1,1,-1,1,0,1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,-1,-1],[-1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,-1,-1]]");

export class CanvasGame {
  constructor(canvas) {
    window.createjs = createjs;
    window.stage = this.stage = new createjs.Stage(canvas)
    this.tileSize = 20; // size in pixel
    this.nTiles = 60;
    this.size = this.tileSize * this.nTiles;
    this.remotePlayers = {};
    this.localPlayer = null;
    this.bullets = [];

    createjs.Ticker.addEventListener('tick', this.onTick.bind(this));
    this.createBackground();
    this.createContainer();
    this.onResize();
  }
  createBackground() {
    this.bg = new createjs.Shape();
    this.stage.addChild(this.bg);
  }
  createContainer() {
    this.container = new createjs.Container();
    this.stage.addChild(this.container);
    this.map = new createjs.Shape();
    this.container.addChild(this.map);
    this.grid = new createjs.Shape();
    this.container.addChild(this.grid);
    this.maze = new createjs.Shape();
    this.container.addChild(this.maze);
  }
  updateContainer() {
    this.container.x = this.stage.canvas.width/2 - this.localPlayer.x;
    this.container.y = this.stage.canvas.height/2 - this.localPlayer.y;
    this.container.width = Math.min(this.size, this.stage.canvas.width/2 + this.localPlayer.x);
    this.container.height = Math.min(this.size, this.stage.canvas.height/2 + this.localPlayer.y);

    this.map.graphics.clear();
    this.map.graphics.beginFill('#fff');
    this.map.graphics.drawRect(0,0,this.container.width, this.container.height);
    this.map.graphics.endFill();
    // draw lines
    this.grid.graphics.clear();
    this.grid.graphics.beginStroke('#f0f0f0');
    for (let i = 0; i <= this.size; i += this.tileSize) {
    	this.grid.graphics.moveTo(i,0);
    	this.grid.graphics.lineTo(i, this.size);
    }
    for (let i = 0; i <= this.size; i += this.tileSize) {
    	this.grid.graphics.moveTo(0,i);
    	this.grid.graphics.lineTo(this.size, i);
    }
    this.grid.graphics.endStroke();
  }
  updateMaze() {
  	this.maze.graphics.clear();
  	this.maze.graphics.beginFill('#ea2');
  	for (let i = 0; i < this.nTiles/3; ++i) {
  		for (let j = 0; j < this.nTiles/3; ++j) {
  			if (mazeM[i][j] == -1) {
  				if (j >= 1 && mazeM[i][j-1] == -1) {
  					this.maze.graphics.drawRect(i*this.tileSize*3+1, j*this.tileSize*3-1, this.tileSize, this.tileSize*2);
  				}
  				this.maze.graphics.drawRect(i*this.tileSize*3+1, j*this.tileSize*3+1, this.tileSize, this.tileSize);
  				if (i >= 1 && mazeM[i-1][j] == -1) {
  					this.maze.graphics.drawRect(i*this.tileSize*3-1, j*this.tileSize*3+1, this.tileSize*2, this.tileSize);
  				}
	  		}
  		}
  	}
  }
  onTick() {
    this.stage.update();
    if (keys != null && keys.check()) {
      socket.emit('move player', keys);
    }
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      now = Date.now();
      bullet.x = bullet.startX + bullet.speed*(now-bullet.timestamp)/1000*Math.cos(bullet.angle);
      bullet.y = bullet.startY + bullet.speed*(now-bullet.timestamp)/1000*(-Math.sin(bullet.angle));
      bullet.setBounds(bullet.x-5, bullet.y-5, 10, 10);

      // const players = Object.keys(this.remotePlayers).map((key) => this.remotePlayers[key]);
      // if (bullet.playerId != this.localPlayer.id) {
      //   players.push(this.localPlayer);
      // }
      //
      // for (const player of players) {
      //   const bulletGlobal = this.container.localToGlobal(bullet.getBounds().x, bullet.getBounds().y);
      //   const playerGlobal = this.container.localToGlobal(player.getBounds().x, player.getBounds().y);
      //
      //   if (Math.abs(bulletGlobal.x - playerGlobal.x)*2 <= (player.getBounds().width + bullet.getBounds().width)
      //   && Math.abs(bulletGlobal.y - playerGlobal.y)*2 <= (player.getBounds().height + bullet.getBounds().height)) {
      //     console.log('bullet', bulletGlobal.x, bulletGlobal.y, bullet.getBounds().width, bullet.getBounds().height);
      //     console.log('player', playerGlobal.x, playerGlobal.y, player.getBounds().width, player.getBounds().height);
      //     this.container.removeChild(bullet);
      //     this.bullets.splice(i, 1);
      //     console.log('dead');
      //   };
      // }
    }
  }
  registerRemotePlayer(p) {
    const newPlayer = new Player(p);
    this.remotePlayers[p.id] = newPlayer;
    this.container.addChild(newPlayer);
  }
  registerLocalPlayer(p) {
    this.localPlayer = new Player(p);
    this.container.addChild(this.localPlayer);
    this.updateContainer();
  }
  removePlayer(id) {
    if (id != this.localPlayerId) {
      this.container.removeChild(this.remotePlayers[id]);
      delete this.remotePlayers[id];
    }
  }
  moveRemotePlayer({id, x, y}) {
    if (this.remotePlayers.hasOwnProperty(id)) {
      this.remotePlayers[id].setPos({x, y});
    } else {
      this.registerRemotePlayer({id, x, y});
    }
  }
  moveLocalPlayer({x, y}) {
    this.localPlayer.setPos({x, y});
    this.updateContainer();
  }
  fireBullet({ x, y }) {
    now = Date.now();
    if (this.localPlayer.lastFiredTimestamp < now - this.localPlayer.fireDelay) {
      this.localPlayer.lastFiredTimestamp = now;
      const playerPos = this.localPlayer.localToGlobal(0, 0);
      const angle = Math.atan2(playerPos.y - y, x - playerPos.x);
      const bullet = this.localPlayer.fireBullet(angle);
      this.registerBullet(bullet);
      socket.emit('fire bullet', bullet);
    }
  }
  registerBullet(bullet) {
    const newBullet = new Bullet(bullet)
    this.bullets.push(newBullet);
    this.container.addChild(newBullet);
  }
  onResize(event) {
    this.stage.canvas.width = window.innerWidth;
    this.stage.canvas.height = window.innerHeight;
    this.bg.graphics.clear();
    this.bg.graphics.beginFill('#222').drawRect(0,0,this.stage.canvas.width, this.stage.canvas.height);
    if (this.localPlayer !== null)
      this.updateContainer();
  	this.updateMaze();
  	}
}
