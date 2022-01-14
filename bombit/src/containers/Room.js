import { useState } from 'react'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {sendData, getGameState, getInitState, getHasEnd, getScores } from "./Client";
// import { useBeforeunload } from 'react-beforeunload';
const Room = ({room, setPage, setRoom, setGameStart})=>{
    const [Wait ,setWait] = useState(false)
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
    const wait = ()=>{
        setWait(true);

        // setWait(false);
    }
    // useBeforeunload(() => alert('You’ll lose your data!'));
    return(
        <div style={{display:room? 'block':'none'}}>
            <div>
                <Row justify="center">
                    <Box style={{display:Wait? 'block':'none'}} >
                        <CircularProgress />
                    </Box>
                </Row>
                <Row justify="center">
                    <Button style={{display:!Wait? 'block':'none' }} className = "button" type="primary"  shape="round" size = {'large'} onClick = {wait}>
                        進入等待
                    </Button>
                </Row>
                <Row justify="center" >
                    <div style={{display:Wait? 'block':'none'}}>
                        目前等待人數 : {waitPeople}
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
export default Room