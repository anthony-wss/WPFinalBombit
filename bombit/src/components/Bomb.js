import * as PIXI from "pixi.js";

class Bomb {
  constructor(texture, x, y) {
    this.sp = new PIXI.Sprite(texture);
    this.container = new PIXI.Container();
    this.container.addChild(this.sp);
    this.sp.x = x;
    this.sp.y = y;
  }
}
export default Bomb;