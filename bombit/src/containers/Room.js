import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {sendData, getGameState, getInitState, getHasEnd, getScores } from "./Client";
const Room = ({room, setPage, setRoom, setGameStart})=>{
    const [Wait ,setWait] = useState(false)
    const previous = ()=>{
        setPage(1);
        setRoom(false);
    }
    const jumpToGamePage = ()=>{
        setPage(4);
        setRoom(false);
        setGameStart(true);
    }
    const wait = ()=>{
        setWait(true);

        // setWait(false);
    }
    return(
        <div style={{display:room? 'block':'none' }}>
            <Col offset={12}><Box style={{display:Wait? 'block':'none' }} sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box></Col>
            <Col offset={10}><Button style={{display:!Wait? 'block':'none' }} className = "button" type="primary"  shape="round" size = {'large'} onClick = {wait}>進入等待</Button>
            </Col>
            <Col offset={10}><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {previous}>回到主選單</Button>
            </Col>
        </div>
    )
}
export default Room