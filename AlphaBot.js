const possible_throws = ["R","P","S","W","D"];


class Bot {
    constructor () {
        this.round = 0;
        this.dynamites = [100, 100];
        this.throw_probabilities  = [1/3, 1/3, 1/3, 0, 0];
        this.tie_streak = 0;
        this.tie_threshold = 2;
        this.enemy_tie_move_counter = [0, 0, 0, 0, 0];
    }

    makeMove(gamestate) {
        this.round++;

        let last_enemy_move = null;
        let last_player_move = null;
        if (this.round > 1){
            const last_round = gamestate.rounds[this.round - 2];
            last_enemy_move = last_round.p2;
            last_player_move = last_round.p1;

            // count what enemy does after tie of length 2
            if (this.tie_streak == 2) {
                this.enemy_tie_move_counter[possible_throws.indexOf(last_enemy_move)] += 1;
            }

            if (last_enemy_move == last_player_move) {
                this.tie_streak++;
            } else {this.tie_streak = 0;}
        }

        if (last_enemy_move == 'D') {
            this.dynamites[1]--;
        }

        // If we reached the tie threshold then do smart stuff (if we can), otherwise choose move at random
        let pick_index = null;

        if (this.tie_streak >= this.tie_threshold && this.dynamites[0] > 0) {
            // do some smart stuff to try and win the ties
            
            let enemy_prev = this.enemy_tie_move_counter.slice();

            if (compute_sum(enemy_prev) == 0) {pick_index = 4;}

            normalise(enemy_prev);

            let opp_move = this.chooseMove(enemy_prev);

            if (opp_move < 3) {pick_index = 4;}
            else if (opp_move == 3) {pick_index = this.chooseMove(this.throw_probabilities);}
            else if (opp_move == 4) {pick_index = 3;}
            else {console.log("ERROR");}

        }
        else {
            pick_index = this.chooseMove(this.throw_probabilities);
        }

        if (pick_index == 4) {
            this.dynamites[0]--;
            // if (this.dynamites[0] == 0){
            //     this.adjustWeights([4],[0]);
            // }
        }
        
        return possible_throws[pick_index];
    }

    chooseMove(weights) {
        // chooses a move weighted by the throw probabilities
        let random_roll = Math.random();
        let pick = 0;

        while (random_roll > 0){
            random_roll -= weights[pick];
            pick++;
        }

        return pick-1;
    }

    adjustWeights(indices, new_values) {
        // set new weights
        for (let i=0; i<indices.length; i++) {
            this.throw_probabilities[indices[i]] = new_values[i];
        }

        normalise(this.throw_probabilities)
    }
}

module.exports = new Bot();

function compute_sum(iterable){
    return iterable.reduce((p,c)=>{return p+c},0);
}


function normalise(weights) {
    // renormalise distribution
    let sum = compute_sum(weights);
    for (let i=0; i<5; i++){
        weights[i] /= sum;
    }
}