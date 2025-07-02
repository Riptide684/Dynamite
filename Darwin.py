from numpy import random, var
from match_player import *


class Population():
    def __init__(self, n=0):
        self.size = n
        self.bots = [None for _ in range(n)]


    def generate_random_bots(self, seeded=False):
        # generates n random probability ProbabilityBots
        seed = [[0.9, 0.2], [0.05, 0.05], [0.05, 0.05]]

        for i in range(self.size):
            if seeded:
                dist = [seed[_][0] + 2*random.rand()*seed[_][1] - seed[_][1] for _ in range(3)]
            else:
                dist = [random.rand() for _ in range(3)]

            self.bots[i] = instantiate_bot("ProbabilityBot", [dist])
            self.bots[i].rescale()


    def evaluate_bots(self):
        # makes the bots play each other and returns an evaluation on how well they performed
        # (can either do 0-1 or add the point total)
        # (should maybe rescale 0-100)

        n = self.size
        points_total = [0 for _ in range(n)]

        for i in range(n):
            for j in range(i+1, n):
                points = play_match([self.bots[i], self.bots[j]])
                points_total[i] += (points[0] >= 1000)
                points_total[j] += (points[1] >= 1000)

        return points_total


    def mutate(self):
        # mutates the intrinsic probability distributions by a Gaussian

        mutation_probability = 0.05
        perturbation_factor = [0.2, 0.002, 0.005] # standard deviation of normal deviation for different moves

        for bot in self.bots:
            for i in range(3):
                if random.rand() < mutation_probability:
                    bot.distribution[i] += random.normal(0, perturbation_factor[i])

            tmp = bot.distribution.copy()
            bot.rescale()


    def crossover(self, parents):
        # returns offspring of two parents
        dist = [(parents[0].distribution[_] + parents[1].distribution[_]) / 2 for _ in range(3)]
        return instantiate_bot("ProbabilityBot", [dist])


    def generate_offspring(self, fitness):
        # generate the next generation of bots by crossover
        n = len(self.bots)
        new_bots = [None for _ in range(n)]
        total_points = sum(fitness)

        new_bots[0] = self.bots[fitness.index(max(fitness))] # select champion
        distance = 0

        for i in range(1, n):
            parents = [None, None]
            for k in range(2):
                choice = random.rand() * total_points
                for j in range(n):
                    choice -=  fitness[j]
                    if choice < 0:
                        parents[k] = self.bots[j]
                        break
                else:
                    raise Exception("Failed to choose parent")

            new_bots[i] = self.crossover(parents)
            distance += self.distribution_distance(parents, new_bots[i])
        else:
            print('The distance between generations is: ' + str(distance / (n - 1)))

        self.bots = new_bots
        self.mutate()


    def distribution_distance(self, parents, child):
        # measures how different a child is from its parents
        d = [0, 0]
        for i in range(2):
            total = 0
            for j in range(3):
                total += (parents[i].distribution[j] - child.distribution[j])**2

            d[i] = total ** 0.5

        return (d[0] + d[1]) / 2


    def display_distributions(self):
        # prints the distributions of all of the bots
        for bot in self.bots:
            print(bot.distribution)


    def evolve_bots(self, generations):
        # evolves the population of bots for some number of generations
        for i in range(generations):
            print("Generation: " + str(i+1) + "\n")
            fitness = self.evaluate_bots()
            self.generate_offspring(fitness)
            # print("Generation diversity is: " + str(self.compute_diversity()))
            population.test_bots(iterations=10)

        return self.bots


    def test_bots(self, iterations=100, verbose=True):
        # tests how well the bots perform against AlphaBot, and returns the bot with the most wins
        tester = instantiate_bot("ProbabilityBot", [[0.9360834471570879, 0.0060507982286550814, 0.057865754614257]])
        wins = 0
        pts = [0, 0]
        champion = None
        best = -1
        for bot in self.bots:
            tmp = 0
            for i in range(iterations):
                outcome = play_match([bot, tester])
                tmp += (outcome[0] >= 1000)
                pts[0] += outcome[0]
                pts[1] += outcome[1]

            wins += tmp
            if tmp > best:
                best = tmp
                champion = bot

        matches = self.size * iterations
        win_percentage = round(100 * wins / matches)
        average_score = [round(pts[0] / matches), round(pts[1] / matches)]
        champion_rate = round(100 * best / iterations)

        if verbose:
            print("The new bots beat AlphaBot with proportion: " + str(win_percentage) + "%")
            print("The average score was: " + str(average_score[0]) + " vs " + str(average_score[1]))
            print("The best win rate was: " + str(champion_rate) + "%")
            print(champion.distribution)
            print('')

        return [win_percentage, average_score, champion, champion_rate]


    def compute_diversity(self):
        # measures the diversity of the population by the variance of their distributions
        return [var([bot.distribution[i] for bot in self.bots]) for i in range(3)]


    def export_bots(self, filename="bot_distributions.txt"):
        # exports the current bot distributions to a file
        with open(filename, 'w') as f:
            for bot in self.bots:
                p = bot.distribution.copy()
                for i in range(3):
                    p[i] = str(p[i])

                f.write(", ".join(p) + "\n")


    def import_bots(self, filename="bot_distributions.txt"):
        # imports the bots saved in a file to the population
        with open(filename, 'r') as f:
            dists = f.read().split('\n')

        if dists[-1] == '':
            dists.pop()

        self.size = len(dists)
        self.bots = [instantiate_bot("ProbabilityBot", [[float(x) for x in dist.split(', ')]]) for dist in dists]
        for bot in self.bots:
            bot.rescale()


if __name__ == "__main__":
    population = Population()
    population.import_bots(filename="best_distributions2.txt")
    population.test_bots()
