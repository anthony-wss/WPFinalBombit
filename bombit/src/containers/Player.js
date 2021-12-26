import * as PIXI from "pixi.js";
import Bomb from "./Bomb";

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
        this.is_moving[0] = 1;
        this.is_moving[4] = 1;
        break;
      case "ArrowDown":
        this.is_moving[1] = 1;
        this.is_moving[4] = 1;
        break;
      case "ArrowLeft":
        this.is_moving[2] = 1;
        this.is_moving[4] = 0;
        break;
      case "ArrowRight":
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
        this.is_moving[0] = 0;
        break;
      case "ArrowDown":
        this.is_moving[1] = 0;
        break;
      case "ArrowLeft":
        this.is_moving[2] = 0;
        break;
      case "ArrowRight":
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