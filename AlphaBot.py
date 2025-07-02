class AlphaBot:
    # chooses a random move according to some probability distribution (including dynamite if any left)
    # never chooses water if opponent has no dynamite

    def __init__(self, probabilities=[9/10, 1/20, 1/20]):
        import random
        self.random = random
        self.legal_moves = ['REG', 'W', 'D']
        self.regular_moves = ['R', 'P', 'S']
        self.distribution = probabilities


    def make_move(self, gamestate, dynamites):
        base_distribution = self.distribution.copy()

        if dynamites[0] == 0:
            self.distribution[2] = 0
            self.rescale()
        if dynamites[1] == 0:
            self.distribution[1] = 0
            self.rescale()

        choice = self.random.random()
        for i in range(3):
            choice -= self.distribution[i]
            if choice <= 0:
                self.distribution = base_distribution
                if i == 0:
                    return self.random.choice(self.regular_moves)
                else:
                    return self.legal_moves[i]

        raise Exception("Failed to choose")


    def rescale(self):
        epsilon = 0
        for i in range(3):
            self.distribution[i] = max([epsilon, self.distribution[i]])

        factor = 1 / sum(self.distribution)
        for i in range(3):
            self.distribution[i] *= factor
