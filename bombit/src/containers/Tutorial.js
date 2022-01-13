const Tutorial = ({tutorial, setTutorial, setPage})=>{
    const previous = ()=>{
        setPage(1);
        setTutorial(false);
    }
    return(
        <div style={{display:tutorial? 'block':'none' }}>
            This page is for Tutorial.
            <button onClick={previous}>prev</button>
        </div>
    )
}
export default Tutorial