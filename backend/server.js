require('dotenv').config()
import dotenv from "dotenv-defaults";
import cors from 'cors'
import router from './src/routes/index.js'
import bodyParser from 'body-parser';
dotenv.config();
const express = require('express')
const mongoose = require ('mongoose');
const SocketServer = require('ws').Server
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router)
mongoose.connect(process.env.MONGO_URL
  , {useNewUrlParser: true ,useUnifiedTopology: true,})
  .then((res)=>console.log("mongo db connection created"));
  app.listen(5000, () =>
    console.log(`Example app listening on port ${5000}!`),
  );
//指定開啟的 port
const PORT = 4000

//創建 express 的物件，並綁定及監聽 port ，且設定開啟後在 console 中提示
const server = express()
    .listen(PORT, () => console.log(`Listening on ${PORT}`))
let player_count = 0; 


//將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server })

//當 WebSocket 從外部連結時執行
wss.on('connection', ws => {
    console.log(player_count,'th Client connected')
    player_count += 1
    ws.send(JSON.stringify({player_uid:player_count,msg:"connect success! Welcome!"}))    // 這一行就可以回傳物件toPrint

    //對 message 設定監聽，接收從 Client 發送的訊息
    // const sendNowTime = setInterval(()=>{
    //     i=i+1
    //     ws.send(String(i)+String(new Date()))
    // },1000)

    ws.onmessage = (byteString) => {
        const {data} = byteString
        const toPrint = JSON.parse(data)    // toPrint 是客戶傳回來的物件
        console.log("from client",toPrint)

        ws.send(JSON.stringify(toPrint))    // 這一行就可以回傳物件toPrint
        // let clients = wss.clients

        // //做迴圈，發送訊息至每個 client
        // clients.forEach(client => {
        //     client.send(data)
        // })
    }

    ws.on('close', () => {
        //連線中斷時停止 setInterval
        // clearInterval(sendNowTime)
        player_count -= 1
        console.log('Close connected')
    })
})