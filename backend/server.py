import asyncio
import json
import websockets
import time
# receive : json.loads(message)

async def echo(websocket, path):
    # print('echo')
    await websocket.send(json.dumps({"type": "handshake"}))
    async for message in websocket:
        print(message,'received from client')
        data = json.loads(message)
        print(type(data))
        for i in range(60):
            time.sleep(0.02)
        # greeting = f"Hello {message}!"
            await websocket.send(message)
        # print(f"> {greeting}")

asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, 'localhost', 4000))
asyncio.get_event_loop().run_forever()