import asyncio
import json
import websockets
import time
from math import floor
from random import randint
import copy
# receive : json.loads(message)
# 收到一個dict物件 {player_id:Int,key:String}
# 會呼叫 player_control(D) 傳入上述物件
# 欲傳回一個 GameState 物件 {Map:[[...],...],pos:[[x1,y1],[x2,y2],...],...}
# 算好地圖後 呼叫boardcast_status(getGameState())傳入上述物件 就會在所有client端收到該物件 由client渲染畫面

# TODO: 炸彈也要判成障礙物

t = 0
UNIT, POWER = 37, 7
HEIGHT, WIDTH = 15, 17
counter = 0
sent = False
bot_list = []
MAP = [
    # 0: 空氣, 1: 不可炸障礙物, 2: 炸彈, 3: 火焰, 4: 可以炸掉的東西
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

    def addPlayer(self, pid):
        self.players.append(Player())
        if pid == 0:
            self.players[-1].x = 5*UNIT
            self.players[-1].y = 5*UNIT
        else:
            self.players[-1].x = 1*UNIT
            self.players[-1].y = 1*UNIT

async def player_control(dic):
    D = DStructure(dic['player_id'], dic['key'])
    pid = int(D.player_id)
    if D.key == 'P':
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
            await boardcast_status({"Map": "End", "players_score": [t*1000, 0, 0, 0]})
            bomb_x, bomb_y = idx(b.x), idx(b.y)
            dir_blocked = [0, 0, 0, 0]

            # 計算火焰要延長幾格
            for j in range(1, POWER+1):

                if not dir_blocked[0]:
                    if bomb_y-j >= 0 and game.Map.obj[bomb_y-j][bomb_x] != 1:
                        game.Map.obj[bomb_y-j][bomb_x] = 3
                        b.fires.append((bomb_y-j, bomb_x))
                        if game.Map.obj[bomb_y-j][bomb_x] == 4:
                            dir_blocked[0] = 1
                    else:
                        dir_blocked[0] = 1

                if not dir_blocked[1]:
                    if bomb_y+j < game.Map.height and game.Map.obj[bomb_y+j][bomb_x] != 1:
                        game.Map.obj[bomb_y+j][bomb_x] = 3
                        b.fires.append((bomb_y+j, bomb_x))
                        if game.Map.obj[bomb_y+j][bomb_x] == 4:
                            dir_blocked[1] = 1
                    else:
                        dir_blocked[1] = 1

                if not dir_blocked[2]:
                    if bomb_x-j >= 0 and game.Map.obj[bomb_y][bomb_x-j] != 1:
                        game.Map.obj[bomb_y][bomb_x-j] = 3
                        b.fires.append((bomb_y, bomb_x-j))
                        if game.Map.obj[bomb_y][bomb_x-j] == 4:
                            dir_blocked[2] = 1
                    else:
                        dir_blocked[2] = 1

                if not dir_blocked[3]:
                    if bomb_x+j < game.Map.width and game.Map.obj[bomb_y][bomb_x+j] != 1:
                        game.Map.obj[bomb_y][bomb_x+j] = 3
                        b.fires.append((bomb_y, bomb_x+j))
                        if game.Map.obj[bomb_y][bomb_x+j] == 4:
                            dir_blocked[3] = 1
                    else:
                        dir_blocked[3] = 1
        
        if t > b.fire_time:
            for pos in b.fires:
                game.Map.obj[pos[0]][pos[1]] = 0
            game.Map.obj[idx(b.y)][idx(b.x)] = 0
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
    global sent
    for ws in connected_clients:
        await ws.send(f"{D}".replace("'",'"',100))
    sent = True
    
async def init_connection(ws):
    global connected_clients
    print("new register",len(connected_clients))

    init_data = {"Map":"Welcome","player_id":len(connected_clients)}
    await ws.send(f"{init_data}".replace("'",'"',100))
    print("sent",init_data)

    message = await ws.recv()
    print(message)
    global counter
    connected_clients.add(ws)
    game.addPlayer(len(connected_clients))
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
            bot_task = asyncio.ensure_future(bot_handle())
            done, pending = await asyncio.wait(
                [listener_task, producer_task,refresh_task,bot_task],
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

            if sent:
                exit()
    finally:
        print("lose a client")
        connected_clients.remove(websocket)

def bot_detect_bomb(): # 回傳炸彈可能會炸的地方 標上-1
    bomb_map = copy.deepcopy(MAP)
    for i in range(15):
        for j in range(17):
            if(bomb_map[i][j]==2):
                for k in range(3):
                    if(bomb_map[i][(j+k)%17] == 0):
                        bomb_map[i][(j+k)%17] = -1
                    elif(bomb_map[i][(j+k)%17] == 1):
                        break
                    elif(bomb_map[i][(j+k)%17] == 4):
                        bomb_map[i][(j+k)%17] = -1
                        break
                for k in range(3):
                    if(bomb_map[(i+k)%15][j] == 0):
                        bomb_map[(i+k)%15][j] = -1
                    elif(bomb_map[(i+k)%15][j] == 1):
                        break
                    elif(bomb_map[(i+k)%15][j] == 4):
                        bomb_map[(i+k)%15][j] = -1
                        break
                for k in range(3):
                    if(bomb_map[i][abs(j-k)] == 0):
                        bomb_map[i][abs(j-k)] = -1
                    elif(bomb_map[i][abs(j-k)] == 1):
                        break
                    elif(bomb_map[i][abs(j-k)] == 4):
                        bomb_map[i][abs(j-k)] = -1
                        break
                for k in range(3):
                    if(bomb_map[abs(i-k)][j] == 0):
                        bomb_map[abs(i-k)][j] = -1
                    elif(bomb_map[abs(i-k)][j] == 1):
                        break
                    elif(bomb_map[abs(i+k)][j] == 4):
                        bomb_map[abs(i+k)][j] = -1
                        break
    return bomb_map
def bot_escape(idx_x,idx_y,find_map):
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        to_traverse = to_traverse[1:]
        added = False
        if(t_x>0):
            if(find_map[t_y][t_x-1] == 0 or find_map[t_y][t_x-1] == -1):
                to_traverse.append([t_x-1,t_y])
                added = True
        if(t_x<17):
            if(find_map[t_y][t_x+1] == 0 or find_map[t_y][t_x+1] == -1):
                to_traverse.append([t_x+1,t_y])
                added = True
        if(t_y<15):
            if(find_map[t_y+1][t_x] == 0 or find_map[t_y+1][t_x] == -1):
                to_traverse.append([t_x,t_y+1])
                added = True
        if(t_y > 0):
            if(find_map[t_y-1][t_x] == 0 or find_map[t_y-1][t_x] == -1):
                to_traverse.append([t_x,t_y-1])
                added = True
        if not added:
            if(find_map[t_x][t_y] != -1):
                return [t_x ,t_y]
    return [-1,-1]

def bot_find_destroyable(idx_x,idx_y):
    find_map = copy.deepcopy(MAP)
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        to_traverse = to_traverse[1:]
        added = False
        if(t_x>0):
            if(find_map[t_y][t_x-1] == 0):
                to_traverse.append([t_x-1,t_y])
                added = True
        if(t_x<17):
            if(find_map[t_y][t_x+1] == 0):
                to_traverse.append([t_x+1,t_y])
                added = True
        if(t_y<15):
            if(find_map[t_y+1][t_x] == 0):
                to_traverse.append([t_x,t_y+1])
                added = True
        if(t_y > 0):
            if(find_map[t_y-1][t_x] == 0):
                to_traverse.append([t_x,t_y-1])
                added = True
        if not added:
            if(t_x>0):
                if(find_map[t_y][t_x-1] == 4):
                    return [t_x,t_y]
            if(t_x<17):
                if(find_map[t_y][t_x+1] == 4):
                    return [t_x,t_y]
            if(t_y<15):
                if(find_map[t_y+1][t_x] == 4):
                    return [t_x,t_y]
            if(t_y > 0):
                if(find_map[t_y-1][t_x] == 4):
                    return [t_x,t_y]

    return [-1,-1]


def bot_move_to(target,pid,idx_x,idx_y):
    pass
def bot_roamer(idx_x,idx_y):
    find_map = copy.deepcopy(MAP)
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        to_traverse = to_traverse[1:]
        added = False
        if(t_x>0):
            if(find_map[t_y][t_x-1] == 0):
                to_traverse.append([t_x-1,t_y])
                added = True
        if(t_x<17):
            if(find_map[t_y][t_x+1] == 0):
                to_traverse.append([t_x+1,t_y])
                added = True
        if(t_y<15):
            if(find_map[t_y+1][t_x] == 0):
                to_traverse.append([t_x,t_y+1])
                added = True
        if(t_y > 0):
            if(find_map[t_y-1][t_x] == 0):
                to_traverse.append([t_x,t_y-1])
                added = True
        if not added:
            return [t_x,t_y]
    
def bot_think(player_id):
    if player_id == -1:
        return
    pos_x = game.players[player_id].x
    pos_y = game.players[player_id].y
    idx_x = idx(pos_x)
    idx_y = idx(pos_y)
    # pos to grid
    bomb_map = bot_detect_bomb()
    target = [] # 要去的下個idx_x/y
    place_bomb = False
    if(bomb_map[idx_y][idx_x] == 2):
        target = bot_escape(idx_x,idx_y,bomb_map)
    else:
        target = bot_find_destroyable(idx_x,idx_y)
        if target[0] == -1:
            target = bot_roamer(idx_x,idx_y)
        else:
            place_bomb = True
    bot_move_to(target,player_id,idx_x,idx_y)
    if(place_bomb):
        player_control({})
        target = bot_escape(idx_x,idx_y,bomb_map)
        bot_move_to(target,player_id,idx_x,idx_y)
    # 若在炸彈範圍 躲避
    # 若無 找下一個附近有可炸物的地方 放炸彈
        #若無可炸物 到處走


def bot_handle():
    for i in bot_list:
        bot_think(i)
    return 

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
