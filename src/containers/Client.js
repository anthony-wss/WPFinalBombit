import { getPlayerId } from "./Game"

var ws = 0
var gameState = 0
var initState = 0
var hasinit = false
var player_cnt = 0
var hasend = false
var players_score = [0, 0, 0, 0]

function connect(){
    //使用 WebSocket 的網址向 Server 開啟連結
    ws = new WebSocket('ws://linux7.csie.ntu.edu.tw:1923')
    //開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
    ws.onopen = () => {
        console.log('open connection')
    }
    ws.onclose = () => {
        console.log('lose connection, retrying')
        // reconnect
        setTimeout(function() {
            connect();
        }, 1000);
    }
    
    //接收 Server 發送的訊息
    ws.onmessage = event => {
        let {data} = event
        let msg = JSON.parse(data)
        // console.log(msg)
        if (msg.Map === "Welcome") {
            initState = msg
            sendData({'msg': `I'm player ${initState.player_id}`})
            console.log(`I'm player ${initState.player_id}`)
        }
        if (msg.Map === "End") {
            console.log(msg.players_score)
            hasend = true
            players_score = msg.players_score
        }
        if (msg.Map === "ping") {
            sendData({'msg':"ping", "sender": `${getPlayerId()}`})
            player_cnt = msg.player_cnt
            // console.log(`current player count: ${player_cnt}`)
        }
        else
            gameState = msg
        // console.log(data)
        // console.log(typeof(msg))
        // console.log(data)
    }

}

const setOnMessage = () => {
}

const sendData = async (data) => {
    await ws.send(
    JSON.stringify(data));

};
const getGameState = () => {
    return gameState
}

const getInitState = () => {
    return initState
}

const getHasEnd = () => {
    return hasend
}

const getScores = () => {
    // return players_score.map((value, idx) => `player ${idx} = ${value}\n`)
    return players_score
}

const getPlayerCnt = () => {
    return player_cnt
}

export {connect, sendData, getGameState, getInitState, getHasEnd, getScores, getPlayerCnt, setOnMessage}