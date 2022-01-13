import { useState } from 'react'
import React from 'react';
import ReactDOM from 'react-dom';
import Room from './Room'
import Rank from './Rank'
import Tutorial from './Tutorial'
import GameOver from './GameOver'
import Credit from './Credit'
import Game from './Game'
import { Button } from 'antd';
import { Row, Col } from 'antd';
import 'antd/dist/antd.css';
import '../App.css'
const App = ()=>{
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
    console.log(page)

    const whichpage = ()=>{
        const jumpToRoomPage = ()=>{
            setPage(2);
            setRoom(true);
        }
        const jumpToTutorialPage = ()=>{
            setPage(2);
            setTutorial(true);
        }
        const jumpToRankPage = ()=>{
            setPage(2);
            setRank(true);
        }
        const jumpToCreditPage = ()=>{
            setPage(2);
            setCredit(true);
        }
        if (page===1) 
        {
            return(
                <>
            <div className="layout">
                <Col offset={10}><Button className = "button" type="primary"  shape="round" size = {'large'} onClick = {jumpToRoomPage}>
                    進入大廳
                </Button></Col>
                <Col offset={10}><Button className = "button" type="primary" shape="round" size={'large'} onClick = {jumpToTutorialPage} >
                    遊戲方法
                </Button></Col>
                <Col offset={10}><Button className = "button" type="primary" shape="round" size={'large'} onClick = {jumpToRankPage} >
                    排行榜
                </Button></Col>
                <Col offset={10}><Button className = "button" type="primary" shape="round" size={'large'} onClick = {jumpToCreditPage} >
                    製作人員
                </Button></Col>
            </div>
            </>
            )
        }
        else if (page===2)
        {
            return(
                <div>
                    <Room room={room} setPage={setPage} setRoom = {setRoom} setGameStart = {setGameStart}/>
                    <Tutorial tutorial={tutorial} setTutorial={setTutorial} setPage={setPage}/>
                    <Rank rank={rank} setRank={setRank} setPage={setPage}/>
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
                <GameOver setPage = {setPage}/>
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
