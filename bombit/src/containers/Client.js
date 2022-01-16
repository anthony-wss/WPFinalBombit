import {Room, getGameStage, setGameStage, getLoaded, setLoaded} from "./Room"

var ws = 0
var gameState = 0
var initState = 0

var pid = -1, room_id = 0

var player_cnt = 0
var players_score = 0
var countdown = 9

function connect(){
    if (getGameStage() === 0) {
        return;
    }
    //使用 WebSocket 的網址向 Server 開啟連結
    ws = new WebSocket('ws://linux7.csie.ntu.edu.tw:1955')
    //開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
    ws.onopen = () => {
        console.log('open connection')
        if (sessionStorage.getItem("pid")) {
            console.log(`pid: ${sessionStorage.getItem("pid")}`)
            pid = sessionStorage.getItem("pid")
        }
        else {
            console.log("pid: -1")
        }
        if (sessionStorage.getItem("room_id")) {
            console.log(`room id: ${sessionStorage.getItem("room_id")}`)
        }
        else {
            console.log("room id: -1")
        }
        sendData({'room_id': `${0}`, 'pid': `${pid}`})
        console.log(`on open ${0} ${pid} sent.`)
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
        if (getGameStage() === 0) {
            ws.close()
            return;
        }
        let {data} = event
        let msg = JSON.parse(data)
        // console.log(msg)
        if (msg.Map === "Welcome") {
            initState = msg
            // sendData({'msg': `I'm player ${initState.player_id}`})
            console.log({'msg': `I'm player ${initState.player_id}`})
            sessionStorage.setItem("pid", initState.player_id)
            sessionStorage.setItem("room_id", initState.room_id)
            pid = initState.player_id
            room_id = initState.room_id
        }
        else if (msg.Map === "End") {
            console.log(msg.players_score)
            players_score = msg.players_score
            sessionStorage.setItem("pid", -1)
            pid = -1
            setGameStage(0);
        }
        else if (msg.Map === "ping") {
            sendData({'msg':"ping", "pid": `${pid}`, "room": `${room_id}`})
            player_cnt = msg.player_cnt
            players_score = msg.score
            countdown = msg.countdown
            console.log(`pid=${pid} room=${room_id} current player count: ${player_cnt} current score: ${players_score}`)
        }
        else
            gameState = msg
        // console.log(data)
        // console.log(typeof(msg))
        // console.log(data)
    }

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

const getScores = () => {
    // return players_score.map((value, idx) => `player ${idx} = ${value}\n`)
    return players_score
}

const getPlayerCnt = () => {
    return player_cnt
}

const setPlayerCnt = (x) => {
    player_cnt = x
}

const closeWebSocket = () => {
    ws.close()
}

const getRoomId = () => {
    return room_id
}

const getPlayerId = () => {
    return pid
}

const getCountDown = () => {
    return countdown
}

export {connect, sendData, getGameState, getInitState, getScores, getPlayerCnt, setPlayerCnt, closeWebSocket, getRoomId, getPlayerId, getCountDown}