const GameStart = ({setPage, setGameStart})=>{
    //call the function below before jump to GameOver.js
    const SetUpBeforeGameOver =()=> {
        setGameStart(false);
        setPage(5);     //goto GameOver.js
    }
    return <div>交給王秀軒了<button onClick = {SetUpBeforeGameOver}>jump to GameOver.js</button></div>
}
export default GameStart