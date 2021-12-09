import { useState } from 'react'
import Room from './Room'
import Rank from './Rank'
import Tutorial from './Tutorial'
import GameOver from './GameOver'
import Credit from './Credit'
const App = ()=>{
    const [page, setPage] = useState(1);
    const [tutorial, setTutorial] = useState(false);
    const [rank, setRank] = useState(false);
    const [credit, setCredit] = useState(false);
    const [room, setRoom] = useState(false);
    console.log(page)

    const whichpage = ()=>{
        const roomPage = ()=>{
            setPage(2);
            setRoom(true);
        }
        const tutorialPage = ()=>{
            setPage(2);
            setTutorial(true);
        }
        const rankPage = ()=>{
            setPage(2);
            setRank(true);
        }
        const creditPage = ()=>{
            setPage(2);
            setCredit(true);
        }
        if (page===1) 
        {
            return(
            <div>
                <button onClick = {roomPage}>room</button>
                <button onClick = {tutorialPage}>tutorial</button>
                <button onClick = {rankPage}>rank</button>
                <button onClick = {creditPage}>credit</button>
            </div>
            )
        }
        else if (page===2)
        {
            console.log(room)
            console.log(tutorial)
            console.log(rank)
            console.log(credit)
            return(
                <div>
                    <Room room={room} setPage={setPage} setRoom = {setRoom}/>
                    <Tutorial tutorial={tutorial} setTutorial={setTutorial} setPage={setPage}/>
                    <Rank rank={rank} setRank={setRank} setPage={setPage}/>
                    <Credit credit={credit} setCredit={setCredit} setPage={setPage}/>
                </div>
            )
        }
        else if (page===5)
        {
            return(
                <GameOver/>
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
