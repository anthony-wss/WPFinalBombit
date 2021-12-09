const Room = ({room, setPage, setRoom})=>{
    const previous = ()=>{
        setPage(1);
        setRoom(false);
    }
    return(
        <div style={{display:room? 'block':'none' }}>
            <button>new room</button>
            <button>join others' room</button>
            <button>search room</button>
            <button onClick={previous}>prev</button>
            
        </div>
    )
}
export default Room