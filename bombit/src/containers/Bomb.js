import * as PIXI from "pixi.js";

class Bomb {
  constructor(texture, x, y, t) {
    this.sp = new PIXI.Sprite(texture);
    // this.container = new PIXI.Container();
    // this.container.addChild(this.sp);
    this.sp.x = x;
    this.sp.y = y;
    this.explode_time = t+1.5;
    this.set_fire = 0;
    this.fires = [];
    this.fire_time = this.explode_time + 0.3;
  }
}
export default Bomb;