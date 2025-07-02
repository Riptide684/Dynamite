class RandomDryBot:
    # chooses a random move (including dynamite if any left) but not water

    def __init__(self):
        from random import randint
        self.random = randint
        self.legal_moves = ['R', 'P', 'S', 'D']

    def make_move(self, gamestate, dynamites):
        if dynamites[0] == 0:
            return self.legal_moves[self.random(0, 2)]
        else:
            return self.legal_moves[self.random(0, 3)]