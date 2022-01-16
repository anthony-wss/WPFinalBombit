import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {connect, sendData, getGameState, getInitState, getScores, getPlayerCnt, setPlayerCnt, closeWebSocket} from "./Client";
// import { useBeforeunload } from 'react-beforeunload';

// 0: 主選單、排行榜等；1: 正在等待其他人加入連線；2: 遊戲中
var gameStage = 0

// 避免pixi一直重新load圖片
var loaded = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getGameStage = () => {
    return gameStage
}

const setGameStage = (x) => {
    gameStage = x
}

const getLoaded = () => {
    return loaded
}

const setLoaded = (x) => {
    return loaded = x
}

const Room = ({room, setPage, setRoom, setGameStart})=>{
    const [Wait ,setWait] = useState(false)
    const [clickedWait, setClickedWait] = useState(false)
    const [playerCnt, setPlayerCnt] = useState(0)
    var waitPeople = 4;
    const previous = ()=>{
        setPage(1);
        setGameStage(0);
        setRoom(false);
        closeWebSocket();
    }
    const jumpToGamePage = ()=>{
        setPage(4);
        setGameStage(2);
        setRoom(false);
        setGameStart(true);
    }
    const wait = async ()=>{
        setTimeout(function() {
            console.log(getGameStage());
        }, 1000);
        setClickedWait(true)
        setGameStage(1)
        connect()
        var player_cnt = getPlayerCnt()
        while (player_cnt < waitPeople) {
            setPlayerCnt(player_cnt);
            await sleep(500)
            player_cnt = getPlayerCnt()
        }
        jumpToGamePage()
        // setWait(false);
    }
    // useBeforeunload(() => alert('You’ll lose your data!'));
    return(
        <div style={{display:room? 'block':'none'}}>
            <div>
                <Row justify="center">
                    <Box style={{display:clickedWait? 'block':'none'}} >
                        <CircularProgress />
                    </Box>
                </Row>
                <Row justify="center">
                    <Button style={{display:!clickedWait? 'block':'none' }} className = "button" type="primary"  shape="round" size = {'large'} onClick = {wait}>
                        進入等待
                    </Button>
                </Row>
                <Row justify="center" >
                    <div style={{display:clickedWait? 'block':'none'}}>
                        完成連線人數 : {getPlayerCnt()}/{waitPeople}
                    </div>
                </Row>
                <Row justify="center">
                    <Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>
                        回到主選單
                    </Button>
                </Row>
            </div>
        </div>
    )
}
export {Room, getGameStage, setGameStage, getLoaded, setLoaded}