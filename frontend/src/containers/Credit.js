const Credit = ({credit, setCredit, setPage})=>{
    const previous = ()=>{
        setPage(1);
        setCredit(false);
    }
    return(
        <div style={{display:credit? 'block':'none' }}>
            This page is for Credit.
            <button onClick={previous}>prev</button>
        </div>
    )
}
export default Credit