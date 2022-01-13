import * as PIXI from "pixi.js";
import React from 'react';
import bunny_img from '../img/bunny.png';
import box_img from '../img/box.png'
import bomb_img from '../img/bomb.png'
import fire_img from '../img/fire.jpg'
import Bomb from "../components/Bomb";
import { useState } from "react";
import {sendData, getGameState, getInitState, getHasEnd, getScores } from "./Client";
// sendData({player_id:1,key:" "}) 
// player_id : int(由伺服器連線時分配) key : String (WASD => 上左下右,P=>空白鍵放炸彈)
//
/*
reference: https://medium.com/@peeyush.pathak18/pixijs-with-react-3cd40738180
*/

var printtt = false

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var loaded = false

function idx(x) {
  return Math.floor((x*2+UNIT)/UNIT/2)
}

var t = 0;
const UNIT = 37, POWER = 7, WIDTH = 17, HEIGHT = 15;
var id = 0;

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.pixi_cnt = null;
    this.Canvas = {
      width: UNIT * WIDTH,
      height: UNIT * HEIGHT
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

  keyDown_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:id,key:"Dw"});
        break;
      case "ArrowDown":
        sendData({player_id:id,key:"Ds"});
        break;
      case "ArrowLeft":
        sendData({player_id:id,key:"Da"});
        break;
      case "ArrowRight":
        sendData({player_id:id,key:"Dd"});
        break;
      case " ":
        sendData({player_id:id,key:"P"});
        break;
      default:
        break;
    }
  }

  keyUp_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:id,key:"Uw"});
        break;
      case "ArrowDown":
        sendData({player_id:id,key:"Us"});
        break;
      case "ArrowLeft":
        sendData({player_id:id,key:"Ua"});
        break;
      case "ArrowRight":
        sendData({player_id:id,key:"Ud"});
        break;
      default:
        break;
    }
  }

  initialize = async (resource) => {
    // 從server接收遊戲常數: UNIT, POWER, WIDTH, HEIGHT
    this.player_texture = resource.player_img.texture
    this.bomb_texture   = resource.bomb_img.texture
    this.fire_texture   = resource.fire_img.texture
    this.box_texture    = resource.box_img.texture

    let gs = getInitState()
    id = gs.player_id
    sendData({'msg': `I'm player ${id}`})
    console.log(`I'm player ${id}`)

    const body = document.querySelector('body');

    body.addEventListener('keydown',(e) => {
      this.keyDown_handler(e.key);
    })
    body.addEventListener('keyup',(e) => {
      this.keyUp_handler(e.key)
    })

    // 每秒執行大約60次
    const main_ticker = new PIXI.Ticker
    main_ticker.add((delta) => {this.tickerLoop(main_ticker)})
    main_ticker.start()
  }

  tickerLoop = async (main_ticker) => {
    // console.log(this.app.stage)
    // 清空stage
    while(this.app.stage.children[0]) {
      this.app.stage.removeChild(this.app.stage.children[0])
    }
    // 接收第一個 GameState
    let gs = getGameState()
    // console.log(gs)
    while (gs === 0) {
      console.log("GameState not Recived")
      gs = getGameState()
      await sleep(300)
    }

    if (getHasEnd()) {
      this.app.ticker.remove(this.app.ticker[0]);
      this.SetUpBeforeGameOver();
      main_ticker.destroy()
    }

    for(let i = 0; i < gs.player_pos.length; i++) {
      let player_sprite = new PIXI.Sprite(this.player_texture);
      player_sprite.x = gs.player_pos[i][0];
      player_sprite.y = gs.player_pos[i][1];
      this.app.stage.addChild(player_sprite);
    }

    if(!printtt) {
      console.log(gs.Map)
      printtt = true
    }
    
    // 按照 this.Map.obj 的結果將箱子、炸彈、火焰畫上去
    for(let y = 0; y < HEIGHT; y++) {
      for(let x = 0; x < WIDTH; x++) {
        if (gs.Map[y][x] == 1) {
          let sprite = new PIXI.Sprite(this.box_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] == 2) {
          let sprite = new PIXI.Sprite(this.bomb_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] == 3) {
          let sprite = new PIXI.Sprite(this.fire_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] == 4) {
          let sprite = new PIXI.Sprite(this.fire_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
      }
    }
  }
  /* 導到GameOver的畫面*/
  SetUpBeforeGameOver = ()=>{
    this.props.setGameStart(false);
    console.log(getScores())
    this.props.setPage(5);
  }
  render() {
    return (
      <>
        <div ref={this.updatePixiCnt} />
        <div id="webgl">
  
        </div>

        <div id="type"></div>
        <div id="rendere"></div>
        <div>分數：{getScores()}<button onClick = {this.SetUpBeforeGameOver}>jump to GameOver.js</button></div>
      </>
    )
  }
}
export default Game;