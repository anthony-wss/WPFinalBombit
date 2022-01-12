import asyncio
import json
import websockets
import time
# receive : json.loads(message)
# 收到一個dict物件 {player_id:Int,key:String}
# 會呼叫 player_control(D) 傳入上述物件
# 欲傳回一個dict物件 {Map:[[...],...],pos:[[x1,y1],[x2,y2],...],...}
# 算好地圖後 呼叫boardcast_status(D)傳入上述物件 就會在所有client端收到該物件 由client渲染畫面

def player_control(D):
    return 1


async def echo(websocket, path):
    print('New_client')
    await websocket.send(json.dumps({"type": "handshake"}))
    async for message in websocket:
        print(message,'received from client')
        data = json.loads(message)
        print(type(data))
        # for i in range(60):
        #     time.sleep(0.02)
        # greeting = f"Hello {message}!"
            # await websocket.send(message)
        # print(f"> {greeting}")

asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, 'linux7.csie.ntu.edu.tw', 1928))
asyncio.get_event_loop().run_forever()