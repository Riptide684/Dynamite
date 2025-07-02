class RandomBot:
    # chooses a random move (including dynamite if any left)

    def __init__(self):
        from random import randint
        self.random = randint
        self.legal_moves = ['R', 'P', 'S', 'W', 'D']

    def make_move(self, gamestate, dynamites):
        if dynamites[0] == 100:
            return self.legal_moves[self.random(0, 3)]
        else:
            return self.legal_moves[self.random(0, 4)]