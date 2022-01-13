import asyncio
import json
import websockets
import time
from math import floor
from random import randint
# receive : json.loads(message)
# 收到一個dict物件 {player_id:Int,key:String}
# 會呼叫 player_control(D) 傳入上述物件
# 欲傳回一個 GameState 物件 {Map:[[...],...],pos:[[x1,y1],[x2,y2],...],...}
# 算好地圖後 呼叫boardcast_status(getGameState())傳入上述物件 就會在所有client端收到該物件 由client渲染畫面

# TODO: 炸彈也要判成障礙物

t = 0
UNIT, POWER = 37, 7
HEIGHT, WIDTH = 13, 13

def idx(x):
    return floor((x*2+UNIT)/UNIT/2)

class Player():
    def __init__(self):
        self.x = UNIT
        self.y = UNIT
        self.is_moving = [0, 0, 0, 0, 0]
        self.speed = 3

class Bomb():
    def __init__(self, player_id, x, y, t):
        self.x = x
        self.y = y
        self.owner = player_id
        self.explode_time = t+1.5
        self.set_fire = 0
        self.fires = []
        self.fire_time = self.explode_time + 0.3

class Map():
    def __init__(self):
        self.width = WIDTH
        self.height = HEIGHT
        self.buf = 12
        self.obj =  [
                # 0: 空氣, 1: 不可炸障礙物, 2: 炸彈, 3: 火焰
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ] 

class DStructure():
    def __init__(self, player_id, key):
        self.player_id = player_id
        self.key = key

class Game():
    def __init__(self):
        self.Map = Map()
        self.players = []
        self.bombs = []
        for y in range(1, self.Map.height-1):
            for x in range(1, self.Map.width-1):
                if x == 1 and y == 1:
                    continue
                self.Map.obj[y][x] = 1 if randint(1, 4) == 1 else 0

    def addPlayer(self):
        self.players.append(Player())

    def start_game(self):
        self.players[0].x = UNIT
        self.players[0].y = UNIT
        # boardcast_status(D)
        # send coor(players[0].x, players[0].y) to players[0]

async def player_control(dic):
    D = DStructure(dic['player_id'], dic['key'])
    pid = int(D.player_id)
    if D.key == 'P':
        game.bombs(Bomb(pid, idx(game.players[pid].x)*UNIT, idx(game.players[pid].y)*UNIT), t)
        game.Map.obj[idx(game.players[pid].x)][idx(game.players[pid].y)] = 2
    elif D.key == 'Dw':
        game.players[pid].is_moving[0] = 1
        game.players[pid].is_moving[4] = 1
    elif D.key == 'Ds':
        game.players[pid].is_moving[1] = 1
        game.players[pid].is_moving[4] = 1
    elif D.key == 'Da':
        game.players[pid].is_moving[2] = 1
        game.players[pid].is_moving[4] = 0
    elif D.key == 'Dd':
        game.players[pid].is_moving[3] = 1
        game.players[pid].is_moving[4] = 0
    elif D.key == 'Uw':
        game.players[pid].is_moving[0] = 0
    elif D.key == 'Us':
        game.players[pid].is_moving[1] = 0
    elif D.key == 'Ua':
        game.players[pid].is_moving[2] = 0
    elif D.key == 'Ud':
        game.players[pid].is_moving[3] = 0

def valid_position(p, dir):
    """
      檢查此移動方向是否合法，並更新玩家的位置
      0:上、1:下、2:左、3:右
    """

    if dir == 0:
        if (
            game.Map.obj[idx(p.y)-1][idx(p.x)] == 1 and
            p.y - (idx(p.y)-1)*UNIT < UNIT + 1
        ):
            return
        if (
            idx(p.x)*UNIT - game.Map.buf < p.x and
            p.x < idx(p.x)*UNIT + game.Map.buf
        ):
            p.x = idx(p.x)*UNIT
            p.y -= p.speed
    elif dir == 1:
        if (
            game.Map.obj[idx(p.y)+1][idx(p.x)] == 1 and
            (idx(p.y)+1)*UNIT - p.y < UNIT + 1
        ):
            return
        if (
            idx(p.x)*UNIT - game.Map.buf < p.x and
            p.x < idx(p.x)*UNIT + game.Map.buf
        ):
            p.x = idx(p.x)*UNIT
            p.y += p.speed
    elif dir == 2:
        if (
            game.Map.obj[idx(p.y)][idx(p.x)-1] == 1 and
            p.x - (idx(p.x)-1)*UNIT < UNIT + 1
        ):
            return
        if (
            idx(p.y)*UNIT - game.Map.buf < p.y and
            p.y < idx(p.y)*UNIT + game.Map.buf
        ):
            p.x -= p.speed
            p.y = idx(p.y)*UNIT
    elif dir == 3:
        if (
            game.Map.obj[idx(p.y)][idx(p.x)+1] == 1 and
            (idx(p.x)+1)*UNIT - p.x < UNIT + 1
        ):
            return
        if (
            idx(p.y)*UNIT - game.Map.buf < p.y and
            p.y < idx(p.y)*UNIT + game.Map.buf
        ):
            p.x += p.speed
            p.y = idx(p.y)*UNIT

async def update():
    """
    每1/60秒call一次的function
    """
    # while 1:
    global t
    time.sleep(0.01)
    t += 0.01

    # 維護每個玩家
    for p in game.players:
        dir = -1
        if p.is_moving[4]:
            if p.is_moving[0]:
                dir = 0
            if p.is_moving[1]:
                dir = 1
        else:
            if p.is_moving[2]:
                dir = 2
            if p.is_moving[3]:
                dir = 3
        valid_position(p, dir)
        # print(p.x, p.y)

    # 維護每個炸彈
    for b in game.bombs:
        # 檢查每顆炸彈的時限
        if t > b.explode_time and not b.set_fire:
            b.set_fire = True
            print('Boom!')
            bomb_x, bomb_y = idx(b.x), idx(b.y)
            dir_blocked = [0, 0, 0, 0]

            # 計算火焰要延長幾格
            for j in range(1, POWER+1):

                if not dir_blocked[0]:
                    if bomb_y-j >= 0 and game.Map.obj[bomb_y-j][bomb_x] != 1:
                        game.Map.obj[bomb_y-j][bomb_x] = 3
                        b.fires.append((bomb_y-j, bomb_x))
                    else:
                        dir_blocked[0] = 1

                if not dir_blocked[1]:
                    if bomb_y+j < game.Map.height and game.Map.obj[bomb_y+j][bomb_x] != 1:
                        game.Map.obj[bomb_y+j][bomb_x] = 3
                        b.fires.append((bomb_y+j, bomb_x))
                    else:
                        dir_blocked[1] = 1

                if not dir_blocked[2]:
                    if bomb_x-j >= 0 and game.Map.obj[bomb_y][bomb_x-j] != 1:
                        game.Map.obj[bomb_y][bomb_x-j] = 3
                        b.fires.append((bomb_y, bomb_x-j))
                    else:
                        dir_blocked[2] = 1

                if not dir_blocked[3]:
                    if bomb_x+j < game.Map.width and game.Map.obj[bomb_y][bomb_x+j] != 1:
                        game.Map.obj[bomb_y][bomb_x+j] = 3
                        b.fires.append((bomb_y, bomb_x+j))
                    else:
                        dir_blocked[3] = 1
        
        if t > b.fire_time:
            for pos in b.fires:
                game.Map.obj[pos[0]][pos[1]] = 0
            game.bombs.remove(b)

async def getGameState():
    return {
        'Map': game.Map.obj,
        'player_pos': [[p.x, p.y] for p in game.players]
    }



class Client:
    # 建構式
    def __init__(self,WS):
        self.status = "Inited"  # Inited,Waiting,Gaming
        self.ws = WS

connected_clients = set()
i = {"counter":1}
# server_socket = None # 要等websockets.server跑過
# def player_control(D):
#     pass

async def boardcast_status(D):
    # await asyncio.sleep(1)
    for ws in connected_clients:
        await ws.send(D)


async def gaming():
    global i 
    time.sleep(0.01)
    i["counter"]+=1
    return i
    
def init_connection(ws):
    global connected_clients
    connected_clients.add(ws)
    game.addPlayer()
    print("new register",len(connected_clients))
    message = ws.recv()
    # data = json.loads(message)
    # while 1:
        # if (data["status"]!="Game")
        # break

async def handler(websocket, path):
    
    # Register & init
    init_connection(websocket)
    # print(game.players)
    try:
        while True:
            listener_task = asyncio.ensure_future(websocket.recv())
            producer_task = asyncio.ensure_future(getGameState())
            refresh_task = asyncio.ensure_future(update())
            done, pending = await asyncio.wait(
                [listener_task, producer_task,refresh_task],
                return_when=asyncio.FIRST_COMPLETED)

            if listener_task in done:
                message = listener_task.result()
                print("from client",message)
                data = json.loads(message)
                # print(type(data))
                await player_control(data)
                # await consumer(message)
            else:
                listener_task.cancel()

            if producer_task in done:
                message = producer_task.result()
                await asyncio.wait([ws.send(f"{message}".replace("'",'"',100)) for ws in connected_clients])
            else:
                producer_task.cancel()
    finally:
        print("lose a client")
        connected_clients.remove(websocket)



# time.sleep(2)
if __name__ == "__main__":
    game = Game()
    asyncio.get_event_loop().run_until_complete(websockets.serve(handler, 'linux7.csie.ntu.edu.tw', 1928))
    asyncio.get_event_loop().run_forever()


# for debugging
# async def echo(websocket, path):
#     print('New_client')
#     await websocket.send(json.dumps({"type": "handshake"}))
#     async for message in websocket:
#         print(message,'received from client')
#         data = json.loads(message)
#         print(type(data))
        # for i in range(60):
        #     time.sleep(0.02)
        # greeting = f"Hello {message}!"
            # await websocket.send(message)
        # print(f"> {greeting}")

# asyncio.get_event_loop().run_until_complete(
#     websockets.serve(echo, 'linux7.csie.ntu.edu.tw', 1928))
# asyncio.get_event_loop().run_forever()
