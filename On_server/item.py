"""
鞋子、藥劑、炸彈+1、火焰、冰、盾牌、手榴彈、地雷、緩速、手掌
"""
class Shoe():
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.id = id

    def get(self, player):
        if player.speed < 3.5:
            player.speed += 0.5

class Potion():
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.id = id

    def get(self, player):
        if player.power < 4:
            player.power += 1

class MoreBomb():
    def __init__(self, x, y, id):
        self.x = x
        self.y = y
        self.id = id

    def get(self, player):
        if player.quota < 4:
            player.quota += 1