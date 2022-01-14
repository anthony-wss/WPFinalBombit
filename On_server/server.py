import asyncio
import json
import websockets
import time
from math import floor
from random import randint, random
from item import *
# receive : json.loads(message)
# 收到一個dict物件 {player_id:Int,key:String}
# 會呼叫 player_control(D) 傳入上述物件
# 欲傳回一個 GameState 物件 {Map:[[...],...],pos:[[x1,y1],[x2,y2],...],...}
# 算好地圖後 呼叫boardcast_status(getGameState())傳入上述物件 就會在所有client端收到該物件 由client渲染畫面

# TODO: 炸彈也要判成障礙物

t = 0
item_time = 4
UNIT, POWER = 37, 1
HEIGHT, WIDTH = 15, 17
counter = 0
sentGameover = False
ITEMNUM = 3
GENITEM = 0.5

class Score():
    def __init__(self):
        self.destroy = 100
        self.getItem = 200
        self.getKill = 1000

MAP = [
    # 0: 空氣, 1: 不可炸障礙物, 2: 炸彈, 3: 火焰, 4: 可以炸掉的東西
    # 5: 鞋子
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 4, 0, 1, 0, 0, 0, 4, 0, 1, 4, 4, 1, 0, 1],
        [1, 0, 4, 4, 4, 4, 0, 1, 1, 1, 4, 4, 0, 4, 4, 0, 1],
        [1, 0, 1, 1, 0, 1, 4, 4, 0, 4, 4, 1, 0, 1, 1, 0, 1],
        [1, 4, 1, 0, 0, 0, 4, 1, 4, 1, 4, 0, 0, 0, 1, 4, 1],
        [1, 4, 0, 4, 1, 1, 4, 0, 1, 0, 4, 1, 1, 0, 0, 4, 1],
        [1, 4, 1, 4, 1, 4, 0, 1, 1, 1, 4, 4, 0, 0, 0, 4, 1],
        [1, 4, 1, 4, 4, 4, 1, 1, 1, 1, 1, 4, 4, 4, 1, 4, 1],
        [1, 0, 1, 0, 1, 4, 0, 1, 1, 1, 0, 0, 1, 0, 1, 4, 1],
        [1, 0, 0, 0, 1, 1, 4, 4, 1, 4, 0, 1, 1, 4, 4, 4, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 1, 4, 1],
        [1, 0, 1, 1, 0, 1, 0, 4, 4, 4, 4, 1, 0, 1, 1, 0, 1],
        [1, 0, 4, 4, 4, 4, 4, 1, 1, 1, 4, 0, 0, 0, 0, 0, 1],
        [1, 4, 1, 4, 4, 1, 0, 4, 4, 4, 0, 1, 0, 4, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]
]

def idx(x):
    return floor((x*2+UNIT)/UNIT/2)

class Player():
    def __init__(self):
        self.x = UNIT
        self.y = UNIT
        self.is_moving = [0, 0, 0, 0, 0]
        self.speed = 2
        self.score = 0
        self.power = POWER
        self.quota = 1

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
        self.obj =  MAP[0]

class DStructure():
    def __init__(self, player_id, key):
        self.player_id = player_id
        self.key = key

class Game():
    def __init__(self):
        self.Map = Map()
        self.players = []
        self.bombs = []
        self.items = []

    def addPlayer(self, pid):
        self.players.append(Player())
        print("addPlayer: pid =", pid)
        if pid == 0:
            self.players[-1].x = 4*UNIT
            self.players[-1].y = 4*UNIT
        else:
            self.players[-1].x = 1*UNIT
            self.players[-1].y = 1*UNIT

    def genItemAt(self, y, x):
        if random() < GENITEM:
            pick_item = randint(5, 5+ITEMNUM-1)
            self.Map.obj[y][x] = pick_item
            if pick_item == 5:
                self.items.append(Shoe(x*UNIT, y*UNIT, 5))
            if pick_item == 6:
                self.items.append(Potion(x*UNIT, y*UNIT, 6))
            if pick_item == 7:
                self.items.append(MoreBomb(x*UNIT, y*UNIT, 7))

async def player_control(dic):
    D = DStructure(dic['player_id'], dic['key'])
    pid = int(D.player_id)
    if D.key == 'P':
        if game.players[pid].quota > 0:
            game.players[pid].quota -= 1
            game.bombs.append(Bomb(pid, idx(game.players[pid].x)*UNIT, idx(game.players[pid].y)*UNIT, t))
            game.Map.obj[idx(game.players[pid].y)][idx(game.players[pid].x)] = 2
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
            (game.Map.obj[idx(p.y)-1][idx(p.x)] == 1 or game.Map.obj[idx(p.y)-1][idx(p.x)] == 2 or game.Map.obj[idx(p.y)-1][idx(p.x)] == 4) and
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
            (game.Map.obj[idx(p.y)+1][idx(p.x)] == 1 or game.Map.obj[idx(p.y)+1][idx(p.x)] == 2 or game.Map.obj[idx(p.y)+1][idx(p.x)] == 4) and
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
            (game.Map.obj[idx(p.y)][idx(p.x)-1] == 1 or game.Map.obj[idx(p.y)][idx(p.x)-1] == 2 or game.Map.obj[idx(p.y)][idx(p.x)-1] == 4) and
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
            (game.Map.obj[idx(p.y)][idx(p.x)+1] == 1 or game.Map.obj[idx(p.y)][idx(p.x)+1] == 2 or game.Map.obj[idx(p.y)][idx(p.x)+1] == 4) and
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
    global t, item_time
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
            # await boardcast_status({"Map": "End", "players_score": [t*1000, 0, 0, 0]})
            bomb_x, bomb_y = idx(b.x), idx(b.y)
            game.Map.obj[bomb_y][bomb_x] = 3
            dir_blocked = [0, 0, 0, 0]
            game.players[b.owner].quota += 1

            # 計算火焰要延長幾格
            for j in range(1, game.players[b.owner].power+1):

                if not dir_blocked[0]:
                    if bomb_y-j >= 0 and game.Map.obj[bomb_y-j][bomb_x] != 1:
                        if game.Map.obj[bomb_y-j][bomb_x] == 4:
                            dir_blocked[0] = 1
                            game.Map.obj[bomb_y-j][bomb_x] = 3
                            game.genItemAt(bomb_y-j, bomb_x)
                            b.fires.append((bomb_y-j, bomb_x))
                            p.score += SCORE.destroy
                        else:
                            game.Map.obj[bomb_y-j][bomb_x] = 3
                            b.fires.append((bomb_y-j, bomb_x))
                    else:
                        dir_blocked[0] = 1

                if not dir_blocked[1]:
                    if bomb_y+j < game.Map.height and game.Map.obj[bomb_y+j][bomb_x] != 1:
                        if game.Map.obj[bomb_y+j][bomb_x] == 4:
                            dir_blocked[1] = 1
                            game.Map.obj[bomb_y+j][bomb_x] = 3
                            game.genItemAt(bomb_y+j, bomb_x)
                            b.fires.append((bomb_y+j, bomb_x))
                            p.score += SCORE.destroy
                        else:
                            game.Map.obj[bomb_y+j][bomb_x] = 3
                            b.fires.append((bomb_y+j, bomb_x))
                    else:
                        dir_blocked[1] = 1

                if not dir_blocked[2]:
                    if bomb_x-j >= 0 and game.Map.obj[bomb_y][bomb_x-j] != 1:
                        if game.Map.obj[bomb_y][bomb_x-j] == 4:
                            dir_blocked[2] = 1
                            game.Map.obj[bomb_y][bomb_x-j] = 3
                            game.genItemAt(bomb_y, bomb_x-j)
                            b.fires.append((bomb_y, bomb_x-j))
                            p.score += SCORE.destroy
                        else:
                            game.Map.obj[bomb_y][bomb_x-j] = 3
                            b.fires.append((bomb_y, bomb_x-j))
                    else:
                        dir_blocked[2] = 1

                if not dir_blocked[3]:
                    if bomb_x+j < game.Map.width and game.Map.obj[bomb_y][bomb_x+j] != 1:
                        if game.Map.obj[bomb_y][bomb_x+j] == 4:
                            dir_blocked[3] = 1
                            game.Map.obj[bomb_y][bomb_x+j] = 3
                            game.genItemAt(bomb_y, bomb_x+j)
                            b.fires.append((bomb_y, bomb_x+j))
                            p.score += SCORE.destroy
                        else:
                            game.Map.obj[bomb_y][bomb_x+j] = 3
                            b.fires.append((bomb_y, bomb_x+j))
                    else:
                        dir_blocked[3] = 1
        
        if t > b.fire_time:
            for pos in b.fires:
                game.Map.obj[pos[0]][pos[1]] = 0
            game.Map.obj[idx(b.y)][idx(b.x)] = 0
            game.bombs.remove(b)

    # 每隔一段時間生成道具
    if t > item_time:
        item_time += 10
        # Debug: 試著印出分數
        for i in range(len(game.players)):
            print(f"player {i}'s score = {game.players[i].score}")

        if len(game.items) < 10:
            item_x = randint(1, WIDTH-1)
            item_y = randint(1, HEIGHT-1)
            while game.Map.obj[item_y][item_x] != 0:
                item_x = randint(1, WIDTH-1)
                item_y = randint(1, HEIGHT-1)
            game.genItemAt(item_y, item_x)

    # 維護每個道具
    for it in game.items:
        if game.Map.obj[idx(it.y)][idx(it.x)] != 3:
            game.Map.obj[idx(it.y)][idx(it.x)] = it.id
        for p in game.players:
            # 每個player有上左右下四個偵測點
            if (
                (idx(p.x + UNIT/2)   == idx(it.x + UNIT/2) and idx(p.y + 9)        == idx(it.y + UNIT/2)) or
                (idx(p.x + 9)        == idx(it.x + UNIT/2) and idx(p.y + UNIT/2)   == idx(it.y + UNIT/2)) or
                (idx(p.x + UNIT - 9) == idx(it.x + UNIT/2) and idx(p.y + UNIT/2)   == idx(it.y + UNIT/2)) or
                (idx(p.x + UNIT/2)   == idx(it.x + UNIT/2) and idx(p.y + UNIT-9)   == idx(it.y + UNIT/2))
            ):
                it.get(p)
                p.score += SCORE.getItem
                game.items.remove(it)
                print(f"item picked")
                game.Map.obj[idx(it.y)][idx(it.x)] = 0


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
    global sentGameover
    for ws in connected_clients:
        await ws.send(f"{D}".replace("'",'"',100))
    sentGameover = True
    
async def init_connection(ws):
    global connected_clients
    print("new register",len(connected_clients))

    init_data = {"Map":"Welcome","player_id":len(connected_clients), "cur_player_cnt":len(connected_clients)+1}
    await ws.send(f"{init_data}".replace("'",'"',100))
    print("sent",init_data)

    message = await ws.recv()
    print(message)
    global counter
    connected_clients.add(ws)
    game.addPlayer(len(connected_clients)-1)
    counter+=1
    print("finished initialization")
    return
    
    # data = json.loads(message)
    # print(data)/
    # while 1:
        # if (data["status"]!="Game")
        # break

async def handler(websocket, path):
    # Register & init
    await init_connection(websocket)
    # print(game.players)
    # print("lose a client")
    # connected_clients.remove(websocket)
    # return 
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
                # print("from client",message)
                data = json.loads(message)
                # print(type(data))
                await player_control(data)
                # await consumer(message)
            else:
                listener_task.cancel()

            if producer_task in done:
                message = producer_task.result()
                # print("send",message['player_pos'])
                await asyncio.wait([ws.send(f"{message}".replace("'",'"',100)) for ws in connected_clients])
            else:
                producer_task.cancel()

            if sentGameover:
                exit()
    finally:
        print("lose a client")
        connected_clients.remove(websocket)



# time.sleep(2)
if __name__ == "__main__":
    game = Game()
    SCORE = Score()
    asyncio.get_event_loop().run_until_complete(websockets.serve(handler, 'linux7.csie.ntu.edu.tw', 1922))
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
