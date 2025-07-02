def check_valid(moves, dynamites):
    # tests move validity
    legal_moves = ['R', 'P', 'S', 'W', 'D']

    for i in range(2):
        if moves[i] not in legal_moves:
            raise Exception("Not a legal move, " + str(i))

        if moves[i] == 'D' and dynamites == 0:
            raise Exception("No dynamite left, " + str(i))

    return


def get_outcome(moves):
    # returns the outcome of the round: bot1 win = +1, bot2 win = -1, draw = 0

    legal_moves = ['R', 'P', 'S', 'W', 'D']
    outcomes = [[ 0, -1,  1,  1, -1],
                [ 1,  0, -1,  1, -1],
                [-1,  1,  0,  1, -1],
                [-1, -1, -1,  0,  1],
                [ 1,  1,  1, -1,  0]]

    n1 = legal_moves.index(moves[0])
    n2 = legal_moves.index(moves[1])

    return outcomes[n1][n2]


def update_data(moves, points, point_carry, dynamites, gamestate):
    # updates the points and dynamite data after calculating the outcome of the round

    outcome = get_outcome(moves)

    if outcome != 0:
        points[(1 - outcome) // 2] += point_carry
        point_carry = 1
    else:
        point_carry += 1

    for i in range(2):
        if moves[i] == 'D':
            dynamites[i] -= 1

    # note that the gamestate for each player is reversed
    gamestate[0].append({"p1" : moves[0], "p2" : moves[1]})
    gamestate[1].append({"p1" : moves[1], "p2" : moves[0]})

    return [points, point_carry, dynamites, gamestate]


def instantiate_bot(bot_name, inputs=[]):
    # instantiates a bot with the given name and inputs for construction
    Bot_class = getattr(__import__(bot_name, fromlist=[bot_name]), bot_name)
    bot = Bot_class(*inputs)  # need to find a way to put inputs for construction here

    return bot


def play_match(bots):
    points = [0, 0]
    dynamites = [100, 100]
    gamestate = [[], []]
    point_carry = 1
    max_rounds = 2500
    point_goal = 1000

    # play the match

    for round in range(max_rounds):
        if max(points) >= point_goal:
            break

        moves = [bots[j].make_move(gamestate[j], dynamites[::1-2*j]) for j in range(2)]

        check_valid(moves, dynamites)
        points, point_carry, dynamites, gamestate = update_data(moves, points, point_carry, dynamites, gamestate)

    return points


if __name__ == "__main__":
    bots = [instantiate_bot("ProbabilityBot", [[0.9411923448803533, 0.006478393328102151, 0.05232926179154446]]), instantiate_bot("ProbabilityBot", [[0.9194950609502676, 0.027892809166457637, 0.05261212988327482]])]

    wins = 0

    for i in range(1000):
        outcome = play_match(bots)
        wins += (outcome[0] >= 1000)

    print(wins)
