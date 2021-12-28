import { useState } from 'react'
import Room from './Room'
import Rank from './Rank'
import Tutorial from './Tutorial'
import GameOver from './GameOver'
import Credit from './Credit'
import GameStart from './GameStart'
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
            <div>
                <button onClick = {jumpToRoomPage}>room</button>
                <button onClick = {jumpToTutorialPage}>tutorial</button>
                <button onClick = {jumpToRankPage}>rank</button>
                <button onClick = {jumpToCreditPage}>credit</button>
            </div>
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
                    <GameStart setPage={setPage} setGameStart={setGameStart}/>
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
