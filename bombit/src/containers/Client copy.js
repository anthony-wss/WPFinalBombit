var ws = new WebSocket('ws://linux7.csie.ntu.edu.tw:1928')
function connect(){
    //使用 WebSocket 的網址向 Server 開啟連結
    ws = new WebSocket('ws://linux7.csie.ntu.edu.tw:1928')

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
    ws.onmessage = event => {
        let {data} = event
        let msg = JSON.parse(data)
        console.log(msg)
        console.log(typeof(msg))
        // console.log(data)
    }
    
    //接收 Server 發送的訊息

}
connect()
const sendData = async (data) => {
    await ws.send(
    JSON.stringify(data));

};
export default sendData