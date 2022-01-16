import asyncio
import json
import websockets
import time
from math import floor
from random import randint, random
from item import *
import signal
from robot import *
import copy

# receive : json.loads(message)
# 收到一個dict物件 {player_id:Int,key:String}
# 會呼叫 player_control(D) 傳入上述物件
# 欲傳回一個 GameState 物件 {Map:[[...],...],pos:[[x1,y1],[x2,y2],...],...}
# 算好地圖後 呼叫boardcast_status(getGameState())傳入上述物件 就會在所有client端收到該物件 由client渲染畫面

# TODO: 炸彈也要判成障礙物

UNIT, POWER = 37, 1
HEIGHT, WIDTH = 15, 17
ITEMNUM = 3
GENITEM = 0.5

first_player_joined = 99999
ping_t = 0

class Score():
    def __init__(self):
        self.destroy = 100
        self.getItem = 200
        self.getKill = 1000

SCORE = Score()

fire_owner = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

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
        self.t = 0
        self.item_time = 4
        self.bot_list = []
        self.prepared_robot = False

    def reset(self):
        self.Map = Map()
        self.players = []
        self.bombs = []
        self.items = []

    def addPlayer(self, pid):
        if len(self.players) >= 4:
            return
        self.players.append(Player())
        print("addPlayer: pid =", pid)
        if pid == 0:
            self.players[0].x = 4*UNIT
            self.players[0].y = 4*UNIT
        elif pid == 1:
            self.players[1].x = 12*UNIT
            self.players[1].y = 4*UNIT
        elif pid == 2:
            self.players[pid].x = 4*UNIT
            self.players[pid].y = 10*UNIT
        elif pid == 3:
            self.players[pid].x = 12*UNIT
            self.players[pid].y = 10*UNIT

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

async def getGameState(game):
    return {
        'Map': game.Map.obj,
        'player_pos': [[p.x, p.y] for p in game.players]
    }

def player_control(dic, game):
    D = DStructure(dic['player_id'], dic['key'])
    pid = int(D.player_id)
    if game.players[pid].x > 5000:
        return
    # print(dic)
    if D.key == 'P':
        if game.players[pid].quota > 0:
            game.players[pid].quota -= 1
            game.bombs.append(Bomb(pid, idx(game.players[pid].x)*UNIT, idx(game.players[pid].y)*UNIT, game.t))
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

def valid_position(p, dir, game):
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

def bot_find_path(path,map,cur,des):    # [-1,-1]代表到了目的地 # -2:traversed
    map[cur[1]][cur[0]] = -2
    path.append(cur)
    # print("Traverse",cur,"path",path)
    if(cur[0] == des[0] and cur[1] == des[1]):
        path.append([-1,-1])
        return True
    t_x = cur[0]
    t_y = cur[1]
    
    if(t_x>0):
        if(map[t_y][t_x-1] == 0):
            if bot_find_path(path,map,[t_x-1,t_y],des):
                return True
    if(t_x<17):
        if(map[t_y][t_x+1] == 0):
            if bot_find_path(path,map,[t_x+1,t_y],des):
                return True
    if(t_y<15):
        if(map[t_y+1][t_x] == 0):
            if bot_find_path(path,map,[t_x,t_y+1],des):
                return True
    if(t_y > 0):
        if(map[t_y-1][t_x] == 0):
            if bot_find_path(path,map,[t_x,t_y-1],des):
                return True
    try:
        path.remove(path[-1])
    except:
        pass
        # print("not found",path)
    # print("Remove",cur,"path",path)
    return False

def bot_move_to(target,pid,idx_x,idx_y,map):
    find_map = copy.deepcopy(map)
    path = []
    if target[0] == idx_x and target[1] == idx_y:
        return [[-1,-1]]
    t_x = idx_x
    t_y = idx_y
    find_map[t_y][t_x] = -2
    path.append([t_x,t_y])
    if(t_x>0):
        if(find_map[t_y][t_x-1] == 0):
            if bot_find_path(path,find_map,[t_x-1,t_y],target) :
                return path
    if(t_x<17):
        if(find_map[t_y][t_x+1] == 0):
            if bot_find_path(path,find_map,[t_x+1,t_y],target):
                return path
    if(t_y<15):
        if(find_map[t_y+1][t_x] == 0):
            if bot_find_path(path,find_map,[t_x,t_y+1],target):
                return path
    if(t_y > 0):
        if(find_map[t_y-1][t_x] == 0):
            if bot_find_path(path,find_map,[t_x,t_y-1],target):
                return path

    return path+[[-1,-1]]

def bot_think(player_id,game):
    bot_list = game.bot_list

    if player_id == -1:
        return
    ind = 0
    bomb_map = bot_detect_bomb(game.Map.obj)
    pos_x = game.players[player_id].x
    pos_y = game.players[player_id].y
    if pos_x > 5000:
        return
    idx_x = idx(pos_x)
    idx_y = idx(pos_y)
    # try:
    for i in range(len(bot_list)):
        if bot_list[i][0] == player_id:
            # print(bot_list[i][1])
            pass
        if bot_list[i][0] == player_id and len(bot_list[i][1])>0 and bot_list[i][1][0] != -1: # 只走 不規劃新的路
            # if game.Map.obj[idx_y][idx_x] == 0 and (bomb_map[bot_list[i][1][0][1]][bot_list[i][1][0][0]] == -1) and  bomb_map[idx_y][idx_x] != -1:
            #     return
            # print(f"bot{player_id}: {bot_list[i][1]}")
            bot_go(player_id,game,i) # 會卡住
            return
    # except IndexError:
    #     return
    # print("think new path")
    
    # pos to grid
    target = [] # 要去的下個idx_x/y
    place_bomb = False

    try:
        if(bomb_map[idx_y][idx_x] == 2):
            target = bot_escape(idx_x,idx_y,bomb_map)
    except IndexError:
        print("bot_escape", idx_y, idx_x)
    else:
        target = bot_find_destroyable(idx_x,idx_y,game.Map.obj)
        if target[0] == -1:
            # print("roaming")
            target = bot_roamer(idx_x,idx_y,game.Map.obj)
        else:
            # print("find_destroy")
            place_bomb = True
    # target = bot_roamer(idx_x,idx_y,game.Map.obj)
    # print("robot",player_id,"wants to move to",target)
    # if place_bomb:
        # print("and place a bomb")
    path = bot_move_to(target,player_id,idx_x,idx_y,game.Map.obj)
    # print("path : ",path)
    for i in bot_list:
        if i[0] == player_id:
            i[1] = path[1:]
            i[2] = place_bomb
    # await bot_go(player_id,path,game) # 會卡住
    # if(place_bomb):
    #     player_control({})
    #     target = bot_escape(idx_x,idx_y,bomb_map)
    #     bot_move_to(target,player_id,idx_x,idx_y,game.Map.obj)
    # 若在炸彈範圍 躲避
    # 若無 找下一個附近有可炸物的地方 放炸彈
        #若無可炸物 到處走


def bot_handle(game):
    # print(f"{bot_list=}")
    for i in game.bot_list:
        bot_think(i[0],game)
    return 

def bot_go(pid, game, ind):
    bot_list = game.bot_list

    pos_x = game.players[pid].x
    pos_y = game.players[pid].y
    path = bot_list[ind][1]
    bomb = bot_list[ind][2]
    nxt = path[0]
    robot_strip = 0.5

    # nxt_t = t + 0.5
    # print("try move to",nxt)
    # while 1:
        # time.sleep(0.0000000001)
        # if t < nxt_t:
        #     continue
        # else:
        #     nxt_t = t+ 0.5
    # print(UNIT)
    # print(pos_x,pos_y,(path[0][0])*UNIT,(path[0][1])*UNIT)
    # print(idx(pos_x),idx(pos_y),path[0][0],path[0][1])

    # if idx(pos_x) == path[0][0] and idx(pos_y) == path[0][1]:
        
    if path[0][0] == -1:
        if bomb:
            # print("debug: put bomb")
            player_control({'player_id': pid, 'key': 'P', 'msg': ''}, game)
        bot_list[ind][1] = []
        return
    # print("try move to",nxt)
    # await player_control({"player_id":pid,"key":"Uw"})
    # await player_control({"player_id":pid,"key":"Ua"})
    # await player_control({"player_id":pid,"key":"Us"})
    # await player_control({"player_id":pid,"key":"Ud"})
    if pos_x < nxt[0] * UNIT:
        # pass
        game.players[pid].x+= robot_strip
        # await player_control({"player_id":pid,"key":"Dd"})
    elif pos_x > nxt[0]* UNIT:
        game.players[pid].x-= robot_strip
        # await player_control({"player_id":pid,"key":"Da"})
    elif pos_y < nxt[1]*UNIT:
        game.players[pid].y+= robot_strip
        # await player_control({"player_id":pid,"key":"Ds"})
    elif pos_y > nxt[1]*UNIT:
        game.players[pid].y-= robot_strip
    else:
        # print("arrived!",path[0])
        bot_list[ind][1] = path[1:]
    
    # if game.players[pid].is_moving[0] == 0: # 向上走
    #     
    # pos_x = game.players[pid].x
    # pos_y = game.players[pid].y

async def update(game, room):
    """
    每1/60秒call一次的function
    """
    global SCORE
    while True:
        await asyncio.sleep(0.01)
        game.t += 0.01
        t = game.t

        bot_handle(game)

        if room.count_alive_players() == 1:
            for i in range(len(room.connected_clients)):
                message = {"Map": "End", "players_score": game.players[i].score}
                if room.connected_clients[i].status:
                    await room.connected_clients[i].ws.send(f"{message}".replace("'",'"',100))
            resetGame()
            print("End Game")
            return

        # 維護每個玩家
        for p in game.players:
            if p.x > 5000:
                continue
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
            valid_position(p, dir, game)
            # print(p.x, p.y)

            if game.Map.obj[idx(p.y)][idx(p.x)] == 3:
                print(f"player dies")
                if fire_owner[idx(p.y)][idx(p.x)] != game.players.index(p):
                    game.players[fire_owner[idx(p.y)][idx(p.x)]].score += SCORE.getKill
                p.x = 9999
                p.y = 9999
                # game.players.remove(p)

        # 維護每個炸彈
        for b in game.bombs:
            # 檢查每顆炸彈的時限
            if t > b.explode_time and not b.set_fire:
                b.set_fire = True
                # print('Boom!')
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
                                fire_owner[bomb_y-j][bomb_x] = b.owner
                                game.genItemAt(bomb_y-j, bomb_x)
                                b.fires.append((bomb_y-j, bomb_x))
                                p.score += SCORE.destroy
                            else:
                                game.Map.obj[bomb_y-j][bomb_x] = 3
                                fire_owner[bomb_y-j][bomb_x] = b.owner
                                b.fires.append((bomb_y-j, bomb_x))
                        else:
                            dir_blocked[0] = 1

                    if not dir_blocked[1]:
                        if bomb_y+j < game.Map.height and game.Map.obj[bomb_y+j][bomb_x] != 1:
                            if game.Map.obj[bomb_y+j][bomb_x] == 4:
                                dir_blocked[1] = 1
                                game.Map.obj[bomb_y+j][bomb_x] = 3
                                fire_owner[bomb_y+j][bomb_x] = b.owner
                                game.genItemAt(bomb_y+j, bomb_x)
                                b.fires.append((bomb_y+j, bomb_x))
                                p.score += SCORE.destroy
                            else:
                                game.Map.obj[bomb_y+j][bomb_x] = 3
                                fire_owner[bomb_y+j][bomb_x] = b.owner
                                b.fires.append((bomb_y+j, bomb_x))
                        else:
                            dir_blocked[1] = 1

                    if not dir_blocked[2]:
                        if bomb_x-j >= 0 and game.Map.obj[bomb_y][bomb_x-j] != 1:
                            if game.Map.obj[bomb_y][bomb_x-j] == 4:
                                dir_blocked[2] = 1
                                game.Map.obj[bomb_y][bomb_x-j] = 3
                                fire_owner[bomb_y][bomb_x-j] = b.owner
                                game.genItemAt(bomb_y, bomb_x-j)
                                b.fires.append((bomb_y, bomb_x-j))
                                p.score += SCORE.destroy
                            else:
                                game.Map.obj[bomb_y][bomb_x-j] = 3
                                fire_owner[bomb_y][bomb_x-j] = b.owner
                                b.fires.append((bomb_y, bomb_x-j))
                        else:
                            dir_blocked[2] = 1

                    if not dir_blocked[3]:
                        if bomb_x+j < game.Map.width and game.Map.obj[bomb_y][bomb_x+j] != 1:
                            if game.Map.obj[bomb_y][bomb_x+j] == 4:
                                dir_blocked[3] = 1
                                game.Map.obj[bomb_y][bomb_x+j] = 3
                                fire_owner[bomb_y][bomb_x+j] = b.owner
                                game.genItemAt(bomb_y, bomb_x+j)
                                b.fires.append((bomb_y, bomb_x+j))
                                p.score += SCORE.destroy
                            else:
                                game.Map.obj[bomb_y][bomb_x+j] = 3
                                fire_owner[bomb_y][bomb_x+j] = b.owner
                                b.fires.append((bomb_y, bomb_x+j))
                        else:
                            dir_blocked[3] = 1
            
            if t > b.fire_time:
                for pos in b.fires:
                    game.Map.obj[pos[0]][pos[1]] = 0
                    fire_owner[pos[0]][pos[1]] = 0
                game.Map.obj[idx(b.y)][idx(b.x)] = 0
                fire_owner[idx(b.y)][idx(b.x)] = 0
                game.bombs.remove(b)

        # 每隔一段時間生成道具
        if t > game.item_time:
            game.item_time += 10
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
                    # print(f"item picked")
                    game.Map.obj[idx(it.y)][idx(it.x)] = 0

rooms = []
loop = 0

def resetGame():
    global rooms
    del rooms[0]
    rooms.append(Room(0))
    return
    rooms[0].reset()

class Client():
    def __init__(self, pid, ws):
        self.pid = pid
        self.ws = ws
        self.status = 1  # 0: 斷線；1: 正常；2: 還沒被加入

class Room():
    def __init__(self, room_id):
        self.connected_clients = [-1, -1, -1, -1]  # 對應到player id: 0, 1, 2, 3
        self.timeout_counter = [0, 0, 0, 0]  # 對應到player id: 0, 1, 2, 3
        self.room_id = room_id  # 未必對應到 rooms 的 index
        self.game = Game()

    def setClient(self, ws, pid):
        self.connected_clients[pid] = Client(pid, ws)
        return pid

    def addClient(self, ws):
        pid = -1
        for i in range(4):
            if self.connected_clients[i] == -1:
                pid = i
                break
        self.setClient(ws, pid)
        return pid

    def start(self):
        """ 加入4位玩家 """
        for i in range(4):
            self.game.addPlayer(i)
        print(f"Game #{self.room_id} Started!")
    
    def count_ready_players(self):
        ans = 0
        for i in range(len(self.connected_clients)):
            if self.connected_clients[i] != -1 and self.connected_clients[i].status == 1:
                ans += 1
            if self.connected_clients[i] != -1 and self.connected_clients[i].ws == None:
                ans += 1
        return ans

    def count_alive_players(self):
        ans = 0
        for i in range(len(self.connected_clients)):
            if self.connected_clients[i].status == 1 and self.game.players[i].x < 5000:
                ans += 1
            if self.connected_clients[i].ws == None and self.game.players[i].x < 5000:
                ans += 1
        return ans

    def reset(self):
        del self.game
        self.game = Game()
        for client in self.connected_clients:
            client.ws.close()
        del self.connected_clients
        self.connected_clients = [-1, -1, -1, -1]
        self.timeout_counter.clear()
        self.timeout_counter = [0, 0, 0, 0]

def prepare_robot(room, game):
    if game.prepared_robot:
        return
    # print("debug: prepare_robot called")
    game.prepared_robot = True
    current_player_num = room.count_ready_players()
    for i in range(current_player_num,4):
        room.connected_clients[i] = Client(i, None)
        room.connected_clients[i].status = 0
        game.bot_list.append([i,[],False]) # pid, path, place bomb after arrive target?
    print(f"number of bot = {len(game.bot_list)}")
    # print(f"{bot_list=}")

async def handler(websocket, path):
    global first_player_joined
    # Register & init
    ip = websocket.remote_address[0] + ':' + str(websocket.remote_address[1])

    # print("new register",len(connected_clients))
    room_info = await websocket.recv()
    room_info = json.loads(room_info)
    room_id = int(room_info['room_id'])
    pid = int(room_info['pid'])

    print(f"new join request: pid = {pid} room_id = {room_id}")

    reconnect = False
    if pid != -1:  # 斷線後連回來的人
        if rooms[room_id].connected_clients[pid] == -1:
            rooms[0].setClient(websocket, pid)
        elif rooms[room_id].connected_clients[pid].status == 0:
            print(f"player {int(room_info['pid'])} in room {room_id} reconnected.")
            rooms[room_id].connected_clients[pid].ws = websocket
            rooms[room_id].connected_clients[pid].status = 1
            rooms[room_id].timeout_counter[pid] = 0
            reconnect = True

    if not reconnect:
        pid = -1  # 房間是否已存在
        for i in range(len(rooms)):
            if rooms[i].room_id == room_id:
                pid = rooms[i].addClient(websocket)
                print(f"room[{room_id}] add player: {pid}")
                break

        if pid == -1:  # 創建新房間
            rooms.append(Room(room_id))
            pid = rooms[-1].addClient(websocket)

    if pid == 0:
        first_player_joined = ping_t + 10

    init_data = {"Map":"Welcome","player_id":pid,"room_id":room_id}
    await websocket.send(f"{init_data}".replace("'",'"',100))
    
    while rooms[room_id].count_ready_players() < 4:
        print(f"player: {pid}, {rooms[room_id].count_ready_players()}")
        await asyncio.sleep(5)

    loop = asyncio.get_event_loop()

    if pid == 0:  # 由pid為0的人開始遊戲
        print("Game start")
        rooms[room_id].start()
        loop.create_task(update(rooms[room_id].game, rooms[room_id]))


    try:
        while True:
            await asyncio.sleep(0.01)
            # if rooms[room_id].connected_clients[pid].status:
            listener_task = asyncio.ensure_future(websocket.recv())
            producer_task = asyncio.ensure_future(getGameState(rooms[room_id].game))
            done, pending = await asyncio.wait(
                [listener_task, producer_task],
                return_when=asyncio.FIRST_COMPLETED)

            # 讀入玩家按鍵輸入
            if listener_task in done:
                message = listener_task.result()
                data = json.loads(message)
                if data['msg'] == "ping":
                    # print(f"player({pid}) in room({room_id}) responded.")
                    rooms[room_id].timeout_counter[pid] = 0
                else:
                    player_control(data, rooms[room_id].game)
            else:
                listener_task.cancel()

            # 發送地圖
            if producer_task in done:
                message = producer_task.result()
                await asyncio.wait([websocket.send(f"{message}".replace("'",'"',100))])
            else:
                producer_task.cancel()
            
    except websockets.exceptions.ConnectionClosedError:
        print(f"lose client: {pid} of room {room_id}")
        for i in range(len(rooms)):
            if rooms[i].room_id == room_id and rooms[i].connected_clients[pid] != -1:
                rooms[i].connected_clients[pid].status = 0
        return

async def pinging_coroutine():
    global ping_t, first_player_joined
    room_id = 0
    while True:
        connected_clients = rooms[0].connected_clients
        # print(f'ping: {ping_t}')
        for i in range(len(connected_clients)):
            if connected_clients[i] != -1 and connected_clients[i].status:
                message = {'Map': 'ping', 'player_cnt': rooms[room_id].count_ready_players()}
                if len(rooms[0].game.players) > i:
                    message['score'] = rooms[room_id].game.players[i].score
                if first_player_joined - ping_t < 20 and first_player_joined - ping_t > 0:
                    message['countdown'] = first_player_joined - ping_t
                try:
                    await connected_clients[i].ws.send(f"{message}".replace("'",'"',100))
                except websockets.exceptions.ConnectionClosedError:
                    print(f"player({i}) in room({room_id}) disconnected (client side).")
                    connected_clients[i].status = 0

                if rooms[0].timeout_counter[i] > 3 and connected_clients[i].status:
                    print(f"player({i}) in room({room_id}) disconnected (timeout).")
                    connected_clients[i].status = 0
        await asyncio.sleep(1)
        ping_t += 1

        if first_player_joined - ping_t < 20 and first_player_joined - ping_t > 0:
            print(f"game will start in {first_player_joined - ping_t} sec.")

        # 機器人timeout之後會被加入
        if int(ping_t) == int(first_player_joined):
            prepare_robot(rooms[0], rooms[0].game)
    print("pinging corroutine exit")

async def main():
    rooms.append(Room(0))
    loop = asyncio.get_event_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)
    loop.create_task(pinging_coroutine())

    async with websockets.serve(handler, 'linux7.csie.ntu.edu.tw', 1955):
        await stop

if __name__ == "__main__":
    asyncio.run(main())
