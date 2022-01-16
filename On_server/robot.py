import copy
def bot_detect_bomb(map): # 回傳炸彈可能會炸的地方 標上-1
    bomb_map = copy.deepcopy(map)
    for i in range(15):
        for j in range(17):
            if(bomb_map[i][j]==2):
                for k in range(1,3):
                    if(bomb_map[i][(j+k)%17] == 0):
                        bomb_map[i][(j+k)%17] = -1
                    elif(bomb_map[i][(j+k)%17] == 1):
                        break
                    elif(bomb_map[i][(j+k)%17] == 4):
                        break
                for k in range(1,3):
                    if(bomb_map[(i+k)%15][j] == 0):
                        bomb_map[(i+k)%15][j] = -1
                    elif(bomb_map[(i+k)%15][j] == 1):
                        break
                    elif(bomb_map[(i+k)%15][j] == 4):
                        break
                for k in range(1,3):
                    if(bomb_map[i][abs(j-k)] == 0):
                        bomb_map[i][abs(j-k)] = -1
                    elif(bomb_map[i][abs(j-k)] == 1):
                        break
                    elif(bomb_map[i][abs(j-k)] == 4):
                        break
                for k in range(1,3):
                    if(bomb_map[abs(i-k)][j] == 0):
                        bomb_map[abs(i-k)][j] = -1
                    elif(bomb_map[abs(i-k)][j] == 1):
                        break
                    elif(bomb_map[abs(i-k)][j] == 4):
                        break
    return bomb_map
def bot_escape(idx_x,idx_y,find_map): # -1 = possible fire, -2 = traversed
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        find_map[t_y][t_x] = -2
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
            if(find_map[t_y][t_x] != -1):
                return [t_x ,t_y]
    return [-1,-1]

def bot_find_destroyable(idx_x,idx_y,map):
    find_map = copy.deepcopy(map)
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        find_map[t_y][t_x] = -2
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



def bot_roamer(idx_x,idx_y,map):
    find_map = copy.deepcopy(map)
    to_traverse = [[idx_x,idx_y]]
    while(to_traverse):
        t_x = to_traverse[0][0]
        t_y = to_traverse[0][1]
        find_map[t_y][t_x] = -2
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
    
