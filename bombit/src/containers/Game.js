import * as PIXI from "pixi.js";
import React from 'react';
import chara_1_img from '../img/chara_1.PNG';
import chara_2_img from '../img/chara_2.PNG';
import chara_3_img from '../img/chara_3.PNG';
import chara_4_img from '../img/chara_4.PNG';
import box_img from '../img/box.png'
import bomb_img from '../img/bomb.png'
import fire_img from '../img/fire.png'
import bag_img from '../img/bag.PNG';
import bush_img from '../img/bush.PNG';
import stone_img from '../img/stone.PNG';
import trunk_img from '../img/trunk.PNG';
import bomb_up_img from '../img/bomb_up.PNG';
import power_up_img from '../img/power_up.PNG';
import speed_up_img from '../img/speed_up.PNG';
import {sendData, getGameState, getInitState, getScores, getPlayerCnt, setPlayerCnt, getRoomId, getPlayerId} from "./Client";
import {getGameStage, setGameStage, getLoaded, setLoaded} from "./Room"
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

const UNIT = 37, WIDTH = 17, HEIGHT = 15;
var id = 0;
var hasRemove = 0;

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
    if (!getLoaded()) {
      PIXI.Loader.shared
        .add('chara_1_img', chara_1_img)
        .add('chara_2_img', chara_2_img)
        .add('chara_3_img', chara_3_img)
        .add('chara_4_img', chara_4_img)
        .add('box_img', box_img)
        .add('bomb_img', bomb_img)
        .add('fire_img', fire_img)
        .add('bag_img', bag_img)
        .add('bush_img', bush_img)
        .add('stone_img', stone_img)
        .add('trunk_img', trunk_img)
        .add('bomb_up_img', bomb_up_img)
        .add('power_up_img', power_up_img)
        .add('speed_up_img', speed_up_img)
        .load((loader, resource) => {
          console.log('Player Loader Done');
          this.initialize(resource);
          setLoaded(true)
        })
    }
  };

  keyDown_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:id,key:"Dw", msg:"", room_id:getRoomId()});
        break;
      case "ArrowDown":
        sendData({player_id:id,key:"Ds", msg:"", room_id:getRoomId()});
        break;
      case "ArrowLeft":
        sendData({player_id:id,key:"Da", msg:"", room_id:getRoomId()});
        break;
      case "ArrowRight":
        sendData({player_id:id,key:"Dd", msg:"", room_id:getRoomId()});
        break;
      case " ":
        sendData({player_id:id,key:"P", msg:"", room_id:getRoomId()});
        break;
      default:
        break;
    }
  }

  keyUp_handler = (key) => {
    switch(key) {
      case "ArrowUp":
        sendData({player_id:id,key:"Uw", msg:"", room_id:getRoomId()});
        break;
      case "ArrowDown":
        sendData({player_id:id,key:"Us", msg:"", room_id:getRoomId()});
        break;
      case "ArrowLeft":
        sendData({player_id:id,key:"Ua", msg:"", room_id:getRoomId()});
        break;
      case "ArrowRight":
        sendData({player_id:id,key:"Ud", msg:"", room_id:getRoomId()});
        break;
      default:
        break;
    }
  }

  initialize = async (resource) => {
    // 從server接收玩家id
    let gs = getInitState()
    id = getPlayerId()

    this.player_1_texture = resource.chara_1_img.texture
    this.player_2_texture = resource.chara_2_img.texture
    this.player_3_texture = resource.chara_3_img.texture
    this.player_4_texture = resource.chara_4_img.texture

    this.bomb_texture   = resource.bomb_img.texture
    this.fire_texture   = resource.fire_img.texture
    this.box_texture    = resource.box_img.texture
    this.bag_texture    = resource.bag_img.texture
    this.bush_texture   = resource.bush_img.texture
    this.stone_texture  = resource.stone_img.texture
    this.trunk_texture  = resource.trunk_img.texture
    this.bomb_up_texture = resource.bomb_up_img.texture
    this.power_up_texture = resource.power_up_img.texture
    this.speed_up_texture = resource.speed_up_img.texture

    const body = document.querySelector('body');

    body.addEventListener('keydown',(e) => {
      this.keyDown_handler(e.key);
    })
    body.addEventListener('keyup',(e) => {
      this.keyUp_handler(e.key)
    })

    // 每秒執行大約60次
    const main_ticker = new PIXI.Ticker()
    main_ticker.add((delta) => {this.tickerLoop(main_ticker)})
    main_ticker.start()

    hasRemove = 0;
  }

  tickerLoop = async (main_ticker) => {
    // console.log(this.app.stage)
    this.props.setPlayerScore(getScores())

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
      await sleep(500)
    }

    if (getGameStage() !== 2 && !hasRemove) {
      hasRemove = 1
      this.app.ticker.remove(this.app.ticker[0]);
      this.SetUpBeforeGameOver();
      main_ticker.destroy()
    }

    // console.log(gs.player_pos)
    for(let i = 0; i < gs.player_pos.length; i++) {
      if (i === 0) {
        let player_sprite = new PIXI.Sprite(this.player_1_texture);
        player_sprite.x = gs.player_pos[i][0];
        player_sprite.y = gs.player_pos[i][1];
        this.app.stage.addChild(player_sprite);
      }
      else if (i === 1) {
        let player_sprite = new PIXI.Sprite(this.player_2_texture);
        player_sprite.x = gs.player_pos[i][0];
        player_sprite.y = gs.player_pos[i][1];
        this.app.stage.addChild(player_sprite);
      }
      else if (i === 2) {
        let player_sprite = new PIXI.Sprite(this.player_3_texture);
        player_sprite.x = gs.player_pos[i][0];
        player_sprite.y = gs.player_pos[i][1];
        this.app.stage.addChild(player_sprite);
      }
      else if (i === 3) {
        let player_sprite = new PIXI.Sprite(this.player_4_texture);
        player_sprite.x = gs.player_pos[i][0];
        player_sprite.y = gs.player_pos[i][1];
        this.app.stage.addChild(player_sprite);
      }
    }

    // Debug用
    // var d1 = new PIXI.Sprite(this.stone_texture);
    // d1.width = 5;
    // d1.height = 5;
    // d1.x = gs.player_pos[0][0] + UNIT/2;
    // d1.y = gs.player_pos[0][1] + 9;
    // this.app.stage.addChild(d1)
    // var d2 = new PIXI.Sprite(this.stone_texture);
    // d2.width = 5;
    // d2.height = 5;
    // d2.x = gs.player_pos[0][0] + 9;
    // d2.y = gs.player_pos[0][1] + UNIT/2;
    // this.app.stage.addChild(d2)
    // var d3 = new PIXI.Sprite(this.stone_texture);
    // d3.width = 5;
    // d3.height = 5;
    // d3.x = gs.player_pos[0][0] + UNIT/2;
    // d3.y = gs.player_pos[0][1] + UNIT - 9;
    // this.app.stage.addChild(d3)
    // var d4 = new PIXI.Sprite(this.stone_texture);
    // d4.width = 5;
    // d4.height = 5;
    // d4.x = gs.player_pos[0][0] + UNIT - 9;
    // d4.y = gs.player_pos[0][1] + UNIT/2;
    // this.app.stage.addChild(d4)

    if(!printtt) {
      console.log(gs.Map)
      console.log(gs.player_pos)
      printtt = true
    }
    
    // 按照 this.Map.obj 的結果將箱子、炸彈、火焰畫上去
    for(let y = 0; y < HEIGHT; y++) {
      for(let x = 0; x < WIDTH; x++) {
        if (gs.Map[y][x] === 1) {
          // 牆壁
          let sprite = new PIXI.Sprite(this.box_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 2) {
          // 炸彈
          let sprite = new PIXI.Sprite(this.bomb_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 3) {
          // 炸彈的火焰
          let sprite = new PIXI.Sprite(this.fire_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 4) {
          // 可以炸的道具
          let sprite = new PIXI.Sprite(this.bag_texture);
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 5) {
          // 鞋子
          let sprite = new PIXI.Sprite(this.speed_up_texture)
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 6) {
          // 藥水
          let sprite = new PIXI.Sprite(this.power_up_texture)
          sprite.x = x* UNIT;
          sprite.y = y* UNIT;
          this.app.stage.addChild(sprite);
        }
        else if (gs.Map[y][x] === 7) {
          // 炸彈+1
          let sprite = new PIXI.Sprite(this.bomb_up_texture)
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
    setGameStage(0);
    setPlayerCnt(0);
    this.props.setPage(5);
  }

  CanStartGame = () => {
    return getPlayerCnt() === 1
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

export {Game};