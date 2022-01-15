import { useState } from 'react'
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import background from '../img/background.png';
import { Affix } from 'antd';
import {connect, sendData, getGameState, getInitState, getHasEnd, getScores, getPlayerCnt, setOnMessage} from "./Client";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';

var isWaiting = false

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const getIsWaiting = () => {
	return isWaiting
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
			setClickedWait(false)
			jumpToGamePage()
	}
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
											完成連線人數 : {getPlayerCnt()}/{waitPeople}
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
export {Room, getIsWaiting}