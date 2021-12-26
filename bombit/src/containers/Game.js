import * as PIXI from "pixi.js";
import React from 'react';
import Player from "./Player";
import bunny_img from '../img/bunny.png';
import box_img from '../img/box.png'
import bomb_img from '../img/bomb.png'
import fire_img from '../img/fire.jpg'
import Bomb from "./Bomb";

/*
reference: https://medium.com/@peeyush.pathak18/pixijs-with-react-3cd40738180
*/

function myRandom() {
  return Math.random()>0.75?1:0;
}

function idx(x) {
  return Math.floor((x*2+UNIT)/UNIT/2)
}

var t = 0;
const UNIT = 37, POWER = 7;

class Game extends React.Component {
  constructor(props) {
    super(props); 
    this.pixi_cnt = null;
    this.Map = {
      width: 13,
      height: 13,
      unit: UNIT,
      buf: 12,
      obj: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ]
    }
    this.Canvas = {
      width: 500,
      height: 500
    }
    this.app = new PIXI.Application({
      view: document.getElementById('main'),
      width: this.Canvas.width,
      height: this.Canvas.height,
      antialias: true,
      backgroundColor: 0x00CC99,
    });
  }
  updatePixiCnt= (element) => {
    // the element is the DOM object that we will use as container to add pixi stage(canvas)
    this.pixi_cnt = element;
    //now we are adding the application to the DOM element which we got from the Ref.
    if(this.pixi_cnt && this.pixi_cnt.children.length<=0) {
      this.pixi_cnt.appendChild(this.app.view);
    }

    // 載入圖片
    PIXI.Loader.shared
      .add('player_img', bunny_img)
      .add('box_img', box_img)
      .add('bomb_img', bomb_img)
      .add('fire_img', fire_img)
      .load((loader, resource) => {
        console.log('Player Loader Done');
        this.initialize(resource);
      })
  };

  initialize = (resource) => {
    this.player = new Player({
      player_img: resource.player_img.texture,
      bomb_img: resource.bomb_img.texture
    });
    this.app.stage.addChild(this.player.container);
    this.player.setPosition(this.Map.unit, this.Map.unit);
    this.fire_texture = resource.fire_img.texture

    const body = document.querySelector('body');

    body.addEventListener('keydown',(e) => {
      this.player.keyDown_handler(e.key);

      // 由 server 處理放炸彈的操作
      if (e.key === " ") {
        var new_bomb = new Bomb(
          resource.bomb_img.texture,
          idx(this.player.sp.x)*this.Map.unit,
          idx(this.player.sp.y)*this.Map.unit,
          t
        );
        this.app.stage.addChild(new_bomb.sp);
        this.player.bombs.push(new_bomb);
      }
    })
    body.addEventListener('keyup',(e) => {
      this.player.keyUp_handler(e.key)
    })

    // 每秒執行大約60次
    this.app.ticker.add((delta) => {
      this.tickerLoop();
    })

    // 隨機生成地圖障礙物的位置
    for(var y = 1; y < this.Map.height-1; y++) {
      for(var x = 1; x < this.Map.width-1; x++) {
        if (x == 1 && y == 1) continue;
        this.Map.obj[y][x] = myRandom();
      }
    }

    // 按照 this.Map.obj 的結果將箱子畫上去
    for(var y = 0; y < this.Map.height; y++) {
      for(var x = 0; x < this.Map.width; x++) {
        if (this.Map.obj[y][x]) {
          var sprite = new PIXI.Sprite(resource.box_img.texture);
          sprite.x = x* this.Map.unit;
          sprite.y = y* this.Map.unit;
      
          this.app.stage.addChild(sprite);
        }
      }
    }
  }

  valid_position = (dir) => {
    /*
      檢查此移動方向是否合法
      0:上、1:下、2:左、3:右
    */
    var coor = {
      x: this.player.sp.x,
      y: this.player.sp.y
    }

    if (dir === 0) {
      if (
        this.Map.obj[idx(coor.y)-1][idx(coor.x)] === 1 &&
        coor.y - (idx(coor.y)-1)*this.Map.unit < this.Map.unit + 1
      ) return;
      if (idx(coor.x)*this.Map.unit - this.Map.buf < coor.x
          && coor.x < idx(coor.x)*this.Map.unit + this.Map.buf) {
        this.player.sp.x = idx(coor.x)*this.Map.unit;
        this.player.sp.y -= this.player.speed;
      }
    }
    else if (dir === 1){
      if (
        this.Map.obj[idx(coor.y)+1][idx(coor.x)] === 1 && 
        (idx(coor.y)+1)*this.Map.unit - coor.y < this.Map.unit + 1
      ) return;
      if (idx(coor.x)*this.Map.unit - this.Map.buf < coor.x
          && coor.x < idx(coor.x)*this.Map.unit + this.Map.buf) {
        this.player.sp.x = idx(coor.x)*this.Map.unit;
        this.player.sp.y += this.player.speed;
      }
    }
    else if (dir === 2){
      if (
        this.Map.obj[idx(coor.y)][idx(coor.x)-1] === 1 &&
        coor.x - (idx(coor.x)-1)*this.Map.unit < this.Map.unit + 1
      ) return;
      if (idx(coor.y)*this.Map.unit - this.Map.buf < coor.y
          && coor.y < idx(coor.y)*this.Map.unit + this.Map.buf) {
        this.player.sp.x -= this.player.speed;
        this.player.sp.y = idx(coor.y)*this.Map.unit;
      }
    }
    else if (dir === 3){
      if (
        this.Map.obj[idx(coor.y)][idx(coor.x)+1] === 1 &&
        (idx(coor.x)+1)*this.Map.unit - coor.x < this.Map.unit + 1
      ) return;
      if (idx(coor.y)*this.Map.unit - this.Map.buf < coor.y
          && coor.y < idx(coor.y)*this.Map.unit + this.Map.buf) {
        this.player.sp.x += this.player.speed;
        this.player.sp.y = idx(coor.y)*this.Map.unit;
      }
    }
  }

  tickerLoop = () => {
    // 取得玩家移動指令
    var dir = this.player.update();
    // 更新合法的位移
    this.valid_position(dir)

    t += 0.01;
    
    // 檢查每顆炸彈的時限
    for (var i = this.player.bombs.length-1; i >= 0; i--) {
      var bomb = this.player.bombs[i];
      if (t > bomb.explode_time && !bomb.set_fire) {
        bomb.set_fire = 1;
        console.log("Boom!")
        var bomb_x = idx(bomb.sp.x), bomb_y = idx(bomb.sp.y);
        var dir_blocked = [0, 0, 0, 0];

        // 計算火焰要延長幾格
        for (var j = 1; j <= POWER; j++) {
          if (!dir_blocked[0]) {
            if (bomb_y-j >= 0 && this.Map.obj[bomb_y-j][bomb_x] != 1) {
              var fire = new PIXI.Sprite(this.fire_texture);
              fire.x = bomb_x*this.Map.unit;
              fire.y = (bomb_y-j)*this.Map.unit;
              bomb.fires.push(fire);
            }
            else {
              dir_blocked[0] = 1;
            }
          }
          if (!dir_blocked[1]) {
            if (bomb_y+j < this.Map.height && this.Map.obj[bomb_y+j][bomb_x] != 1) {
              var fire = new PIXI.Sprite(this.fire_texture);
              fire.x = bomb_x*this.Map.unit;
              fire.y = (bomb_y+j)*this.Map.unit;
              bomb.fires.push(fire);
            }
            else {
              dir_blocked[1] = 1;
            }
          }
          if (!dir_blocked[2]) {
            if (bomb_x-j >= 0 && this.Map.obj[bomb_y][bomb_x-j] != 1) {
              var fire = new PIXI.Sprite(this.fire_texture);
              fire.x = (bomb_x-j)*this.Map.unit;
              fire.y = bomb_y*this.Map.unit;
              bomb.fires.push(fire);
            }
            else {
              dir_blocked[2] = 1;
            }
          }
          if (!dir_blocked[3]) {
            if (bomb_x+j >= 0 && this.Map.obj[bomb_y][bomb_x+j] != 1) {
              var fire = new PIXI.Sprite(this.fire_texture);
              fire.x = (bomb_x+j)*this.Map.unit;
              fire.y = bomb_y*this.Map.unit;
              bomb.fires.push(fire);
            }
            else {
              dir_blocked[3] = 1;
            }
          }
        }

        // 將火焰畫上去
        for (var j = 0; j < bomb.fires.length; j++) {
          this.app.stage.addChild(bomb.fires[j]);
        }
      }

      // 爆炸時間結束，將火焰刪除
      if (t > bomb.fire_time) {
        for (var j = 0; j < bomb.fires.length; j++) {
          this.app.stage.removeChild(bomb.fires[j]);
        }
        this.app.stage.removeChild(bomb.sp);
        this.player.bombs.splice(i, 1);
      }
    }
  }
  
  render() {
    return (
      <>
        <div ref={this.updatePixiCnt} />
        <div id="webgl">
  
        </div>

        <div id="type"></div>
        <div id="rendere"></div>
      </>
    )
  }
}
export default Game;