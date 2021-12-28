const GameOver = ({setPage})=>{
    console.log("GameOVer")
    const HomePage = ()=>{
        setPage(1)
    }
    return(
        <div>This is the page for game over.
            <button onClick = {HomePage}>Back To Home Page</button>
        </div>
    )
}
export default GameOver