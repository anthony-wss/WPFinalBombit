import { useState } from 'react'
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import background from '../img/background.png';
import { Affix } from 'antd';
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';
import {connect, sendData, getGameState, getInitState, getScores, getPlayerCnt, setPlayerCnt, closeWebSocket, getCountDown} from "./Client";
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
	const theme = createTheme({
		palette: {
			primary: {
				// Purple and green play nicely together.
				main: '#ef6c00',
			},
			secondary: {
				// This is green.A700 as hex.
				main: '#11cb5f',
			},
		},
	});
    const [Wait ,setWait] = useState(false)
    const [clickedWait, setClickedWait] = useState(false)
    const [playerCnt, setPlayerCnt] = useState(0)
    const [countdown, setCountdown] = useState(9)
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
			setCountdown(getCountDown())
        }
        jumpToGamePage()
        // setWait(false);
    }
    // useBeforeunload(() => alert('You’ll lose your data!'));
    return(
        <ThemeProvider theme={theme}>
			<Row justify="center">
				<div style={{
						display:room? 'block':'none',
						
								height:"600px",
								width:"1370px", 
								backgroundImage: `url(${background})`
						
				}}>
					<Col offset={15}>
						<Affix offsetTop={385}>
							<Row justify="center">
									<Box style={{display:clickedWait? 'block':'none'}} >
											<CircularProgress />
									</Box>
							</Row>
						</Affix>

						<Affix offsetTop={445}>
							<Row justify="center">
								<Button style={{display:!clickedWait? 'block':'none'}} className = "button" variant="contained" color="primary" onClick = {wait}>
									進入等待
								</Button>
							</Row>
						</Affix>
						
						<Affix offsetTop={445}>
							<Row justify="center" >
									<div style={{display:clickedWait? 'block':'none'}}>
											完成連線人數 : {getPlayerCnt()}/{waitPeople}<br></br>
											遊戲將於 {countdown} 秒後開始... 
									</div>
							</Row>
						</Affix>

						<Affix offsetTop={515}>
							<Row justify="center">
								<Button className = "button" variant="contained" color="primary" onClick = {previous}>
									回到主選單
								</Button>
							</Row>
						</Affix>
					</Col>
				</div>
			</Row>
		</ThemeProvider>
    )
}
export {Room, getGameStage, setGameStage, getLoaded, setLoaded}