import { useState } from 'react'
import React from 'react';
import ReactDOM from 'react-dom';
import {Room, setGameStage} from './Room'
import Rank from './Rank'
import Tutorial from './Tutorial'
import GameOver from './GameOver'
import Credit from './Credit'
import {Game} from './Game'
import { Affix } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import background from '../img/background.png';
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { purple, orange } from '@mui/material/colors';

import '../App.css'

const App = ()=>{
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
    /*
    page=1:homepage
    page=2:room、tutorial、credit、rank
    page=3:pair
    page=4:GameStart
    page=5:Gameover
    */
    const [page, setPage] = useState(1);
    const [gameStart, setGameStart] = useState(false)
    const [tutorial, setTutorial] = useState(false);
    const [rank, setRank] = useState(false);
    const [credit, setCredit] = useState(false);
    const [room, setRoom] = useState(false);
    const [queryRank, setQueryRank] = useState(0);
    console.log(page)

    const whichpage = ()=>{
        const jumpToRoomPage = ()=>{
            setPage(2);
            setGameStage(2);
            setRoom(true);
        }
        const jumpToTutorialPage = ()=>{
            setPage(2);
            setGameStage(2);
            setTutorial(true);
        }
        const jumpToRankPage = ()=>{
            setPage(2);
            setGameStage(2);
            setRank(true);
            setQueryRank(1);
        }
        const jumpToCreditPage = ()=>{
            setPage(2);
            setGameStage(2);
            setCredit(true);
        }
        const gotoGameOver = ()=>{
            setGameStage(2);
            setPage(5);
        }
        if (page===1) 
        {
            return(
                <ThemeProvider theme={theme}>
                <Row justify="center">
            <div className="layout" 
                style = {{
                    height:"600px",
                    width:"1370px", 
                    backgroundImage: `url(${background})`
                }}
            >
                <Row></Row>
                <Affix offsetTop={385}><Col offset={16}><Button className = "button" variant="contained" color="primary" onClick = {jumpToRoomPage}> 
                    進入大廳
                </Button></Col></Affix>
                {/* <Affix offsetTop={425}><Col offset={16}><Button className = "button" variant="contained" color="primary" onClick = {jumpToTutorialPage} >
                    遊戲方法
                </Button></Col></Affix> */}
                <Affix offsetTop={475}><Col offset={16}><Button className = "button" variant="contained" color="primary" onClick = {jumpToRankPage} >
                    排行榜
                </Button></Col></Affix>
                <Affix offsetTop={565}><Col offset={16}><Button className = "button" variant="contained" color="primary" onClick = {jumpToCreditPage} >
                    製作人員
                </Button></Col></Affix>
                {/* <Affix offsetTop={450}><Col offset={16}><Button className = "button" type="primary" shape="round" size={'large'} onClick = {jumpToCreditPage} >
                    製作人員
                </Button></Col></Affix>       */}
                <Button className = "button" variant="contained" color="primary"  onClick = {gotoGameOver}>
                    Go to Gameover
                </Button>
            </div>
            </Row>
            </ThemeProvider>
            )
        }
        else if (page===2)
        {
            return(
                <div>
                    <Room room={room} setPage={setPage} setRoom = {setRoom} setGameStart = {setGameStart}/>
                    <Tutorial tutorial={tutorial} setTutorial={setTutorial} setPage={setPage}/>
                    <Rank rank={rank} setRank={setRank} setPage={setPage} setQueryRank={setQueryRank} queryRank={queryRank}/>
                    <Credit credit={credit} setCredit={setCredit} setPage={setPage}/>
                </div>
            )
        }
        else if (page===4)
        {
            return(
                <div>
                    <Game setPage={setPage} setGameStart={setGameStart}/>
                </div>
            )
        }
        else if (page===5)
        {
            return(
                <div>
                    <GameOver setPage = {setPage}/>
                </div>
            )
        }
        
    }
    return(
        <div>
            {whichpage()}
        </div>
    )

}
export default App;
