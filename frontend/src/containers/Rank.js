const Rank = ({rank, setRank, setPage})=>{
    const previous = ()=>{
        setPage(1);
        setRank(false);
    }
    return(
        <div style={{display:rank? 'block':'none' }}>
            This page is for Rank.
            
            <button onClick={previous}>prev</button>
        </div>
    )
}
export default Rank