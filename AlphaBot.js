const possible_throws = ["R","P","S","W","D"];


class Bot {
    constructor () {
        this.round = 0;
        this.dynamites = [100, 100];
        this.throw_probabilities  = [1/3, 1/3, 1/3, 0, 0];
        this.tie_streak = 0;
        this.tie_dynamite_threshold = 2;
        this.tie_water_threshold = 3;
        this.tie_reg_threshold = 4;
    }

    makeMove(gamestate) {
        this.round++;

        let last_enemy_move = null;
        let last_player_move = null;
        if (this.round > 1){
            const last_round = gamestate.rounds[this.round - 2];
            last_enemy_move = last_round.p2;
            last_player_move = last_round.p1;
            if (last_enemy_move == last_player_move) {
                this.tie_streak++;
            } else {this.tie_streak = 0;}
        }

        if (last_enemy_move == 'D') {
            this.dynamites[1]--;
        }

        // If we reached the tie threshold then pick dynamite (if we can), otherwise choose move at random
        let pick_index = null;

        if (this.tie_streak >= this.tie_reg_threshold){
            pick_index = this.chooseMove();
            // pick random regular
        } 
        else if (this.tie_streak >= this.tie_water_threshold && this.dynamites[1] > 0){
            pick_index = 3;
        } 
        else if (this.tie_streak >= this.tie_dynamite_threshold && this.dynamites[0] > 0){
            pick_index = 4;
        } 
        else {
            pick_index = this.chooseMove();
        }

        if (pick_index == 4) {
            this.dynamites[0]--;
            if (this.dynamites[0] == 0){
                this.adjustWeights([4],[0]);
            }
        }
        
        return possible_throws[pick_index];
    }

    chooseMove() {
        // chooses a move weighted by the throw probabilities
        let random_roll = Math.random();
        let pick = 0;

        while (random_roll > 0){
            random_roll -= this.throw_probabilities[pick];
            pick++;
        }

        return pick-1;
    }

    adjustWeights(indices, new_values) {
        // set new weights
        for (let i=0; i<indices.length; i++) {
            this.throw_probabilities[indices[i]] = new_values[i];
        }

        // renormalise distribution
        let sum = compute_sum(this.throw_probabilities);
        for (let i=0; i<5; i++){
            this.throw_probabilities[i] /= sum;
        }
    }
}

module.exports = new Bot();

function compute_sum(iterable){
    return iterable.reduce((p,c)=>{return p+c},0);
}