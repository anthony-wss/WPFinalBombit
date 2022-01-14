import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {sendData, getGameState, getInitState, getHasEnd, getScores, get, getPlayerCnt, setOnMessage } from "./Client";


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Room = ({room, setPage, setRoom, setGameStart})=>{
    const [player_cnt, setPlayerCnt] = useState(0)
    const [clickedWait, setClickedWait] = useState(false)
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
        setOnMessage()
        var player_cnt = getPlayerCnt()
        while (player_cnt !== 2) {
            setPlayerCnt(player_cnt);
            await sleep(1000)
            player_cnt = getPlayerCnt()
        }
        jumpToGamePage()
        // setWait(false);
    }
    return(
        <div style={{display:room? 'block':'none' }}>
            <Col offset={12}><Box style={{display:clickedWait? 'block':'none' }} sx={{ display: 'flex' }}>
                <CircularProgress />
                current player: ({player_cnt}/2)
            </Box></Col>
            <Col offset={10}><Button style={{display:!clickedWait? 'block':'none' }} className = "button" type="primary"  shape="round" size = {'large'} onClick = {wait}>進入等待</Button>
            </Col>
            <Col offset={10}><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>回到主選單</Button>
            </Col>
        </div>
    )
}
export default Room