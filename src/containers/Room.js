import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {connect, sendData, getGameState, getInitState, getHasEnd, getScores, getPlayerCnt, setOnMessage} from "./Client";
// import { useBeforeunload } from 'react-beforeunload';

var isWaiting = false

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getIsWaiting = () => {
    return isWaiting
}

const Room = ({room, setPage, setRoom, setGameStart})=>{
    const [Wait ,setWait] = useState(false)
    const [clickedWait, setClickedWait] = useState(false)
    const [playerCnt, setPlayerCnt] = useState(0)
    var waitPeople = 2;
    const previous = ()=>{
        setPage(1);
        setRoom(false);
    }
    const jumpToGamePage = ()=>{
        setPage(4);
        setRoom(false);
        setGameStart(true);
    }
    const wait = async ()=>{
        setClickedWait(true)
        await connect()
        isWaiting = true
        var player_cnt = getPlayerCnt()
        while (player_cnt < waitPeople) {
            setPlayerCnt(player_cnt);
            await sleep(1000)
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
export {Room, getIsWaiting}