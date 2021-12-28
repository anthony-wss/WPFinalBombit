const Room = ({room, setPage, setRoom, setGameStart})=>{
    const previous = ()=>{
        setPage(1);
        setRoom(false);
    }
    const jumpToGamePage = ()=>{
        setPage(4);
        setRoom(false);
        setGameStart(true);
    }
    return(
        <div style={{display:room? 'block':'none' }}>
            <button onClick={jumpToGamePage}>Start</button>
            <button onClick={previous}>prev</button>
            
        </div>
    )
}
export default Room