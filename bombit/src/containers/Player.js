import * as PIXI from "pixi.js";
import Bomb from "./Bomb";
import sendData from "./Client";

class Player {
  constructor(texture) {
    this.sp = new PIXI.Sprite(texture.player_img);
    this.bomb_img = texture.bomb_img;
    this.container = new PIXI.Container();
    this.container.addChild(this.sp);
    this.is_moving = [0, 0, 0, 0, 0];
    this.bombs = [];
    this.speed = 3;
  }

  setPosition = (x, y) => {
    this.sp.x = x;
    this.sp.y = y;
  }

  keyDown_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:1,key:"Dw"});
        this.is_moving[0] = 1;
        this.is_moving[4] = 1;
        break;
      case "ArrowDown":
        sendData({player_id:1,key:"Ds"});
        this.is_moving[1] = 1;
        this.is_moving[4] = 1;
        break;
      case "ArrowLeft":
        sendData({player_id:1,key:"Da"});
        this.is_moving[2] = 1;
        this.is_moving[4] = 0;
        break;
      case "ArrowRight":
        sendData({player_id:1,key:"Dd"});
        this.is_moving[3] = 1;
        this.is_moving[4] = 0;
        break;
      default:
        break;
    }
  }

  keyUp_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:1,key:"Uw"});
        this.is_moving[0] = 0;
        break;
      case "ArrowDown":
        sendData({player_id:1,key:"Us"});
        this.is_moving[1] = 0;
        break;
      case "ArrowLeft":
        sendData({player_id:1,key:"Da"});
        this.is_moving[2] = 0;
        break;
      case "ArrowRight":
        sendData({player_id:1,key:"Dd"});
        this.is_moving[3] = 0;
        break;
      default:
        break;
    }
  }

  update = () => {
    this.sp.vx = 0;
    this.sp.vy = 0;
    if (this.is_moving[4]) {
      if (this.is_moving[0]) {
        return 0;
      }
      if (this.is_moving[1]) {
        return 1;
      }
    }
    else {
      if (this.is_moving[2]) {
        return 2;
      }
      if (this.is_moving[3]) {
        return 3;
      }
    }
  }
}
export default Player;