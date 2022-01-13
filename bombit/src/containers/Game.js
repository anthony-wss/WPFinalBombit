import * as PIXI from "pixi.js";
import React from 'react';
import Player from "./Player";
import bunny_img from '../img/bunny.png';
import box_img from '../img/box.png'
import bomb_img from '../img/bomb.png'
import fire_img from '../img/fire.jpg'
import Bomb from "./Bomb";
import sendData from "./Client";
// sendData({player_id:1,key:" "}) 
// player_id : int(由伺服器連線時分配) key : String (WASD => 上左下右,P=>空白鍵放炸彈)
//
/*
reference: https://medium.com/@peeyush.pathak18/pixijs-with-react-3cd40738180
*/

var loaded = false

function idx(x) {
  return Math.floor((x*2+UNIT)/UNIT/2)
}

var t = 0;
const UNIT = 37, POWER = 7, WIDTH = 13, HEIGHT = 13;

class Game extends React.Component {
  constructor(props) {
    super(props); 
    this.pixi_cnt = null;
    this.Map = [
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
    if (!loaded) {
      PIXI.Loader.shared
        .add('player_img', bunny_img)
        .add('box_img', box_img)
        .add('bomb_img', bomb_img)
        .add('fire_img', fire_img)
        .load((loader, resource) => {
          console.log('Player Loader Done');
          this.initialize(resource);
          loaded = true
        })
    }
  };

  initialize = (resource) => {
    // 從server接收遊戲常數: UNIT, POWER, WIDTH, HEIGHT
    this.player_texture = resource.player_img.texture
    this.bomb_texture   = resource.bomb_img.texture
    this.fire_texture   = resource.fire_img.texture
    this.box_texture    = resource.box_img.texture

    const body = document.querySelector('body');

    body.addEventListener('keydown',(e) => {
      this.player.keyDown_handler(e.key);
    })
    body.addEventListener('keyup',(e) => {
      this.player.keyUp_handler(e.key)
    })

    // 每秒執行大約60次
    this.app.ticker.add((delta) => {
      this.tickerLoop();
    })
  }

  tickerLoop = () => {
    // console.log(this.app.stage)
    // 清空stage
    while(this.app.stage.children[0]) {
      this.app.stage.removeChild(this.app.stage.children[0])
    }
    // 接收第一個 GameState
    var gs = {
      Map: [
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
      ],
      player_pos: [[1, 1]]
    }

    var player_sprite = new PIXI.Sprite(this.player_texture);
    player_sprite.x = gs.player_pos[0][0]*UNIT;
    player_sprite.y = gs.player_pos[0][1]*UNIT;
    this.app.stage.addChild(player_sprite);
    
    // 按照 this.Map.obj 的結果將箱子、炸彈、火焰畫上去
    for(let y = 0; y < HEIGHT; y++) {
      for(let x = 0; x < WIDTH; x++) {
        if (gs.Map[y][x] == 1) {
          var sprite = new PIXI.Sprite(this.box_texture);
        }
        else if (gs.Map[y][x] == 2) {
          var sprite = new PIXI.Sprite(this.bomb_texture);
        }
        else if (gs.Map[y][x] == 3) {
          var sprite = new PIXI.Sprite(this.fire_texture);
        }
        sprite.x = x* UNIT;
        sprite.y = y* UNIT;
        this.app.stage.addChild(sprite);
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