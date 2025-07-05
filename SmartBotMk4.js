

// refactor later: make into an enum?
const possible_throws = ["R","P","S","W","D"];
const percent_modifier = 0.01;
const dynamite_tie_streak_initial_threshold = 4;


class Bot {
    constructor () {
        this.round_number = 0;
        this.dynamite_count = 100;
        this.enemy_dynamite_count = 100;
        this.throw_weights  = [1/3, 1/3, 1/3, 0/100, 0/100];
        this.tie_streak = 0;
        this.dynamite_tie_streak_threshold = dynamite_tie_streak_initial_threshold;
        this.water_tie_streak_threshold = dynamite_tie_streak_initial_threshold+1;
        this.streaks = [];
    }

    makeMove(gamestate) {
        let last_enemy_move = null;
        let last_player_move = null;
        if (this.round_number > 0){
            const last_round = gamestate.rounds[gamestate.rounds.length - 1];
            last_enemy_move = last_round.p2;
            last_player_move = last_round.p1;
        }

        this.round_number++;

        if (last_enemy_move == last_player_move) {
            
            this.tie_streak++;
        } else if (this.tie_streak > 0) {
            if (last_enemy_move=="D" && this.dynamite_tie_streak_threshold>1){
                this.dynamite_tie_streak_threshold-=.5;
                this.water_tie_streak_threshold-=.5;
            }
            // if (last_player_move=="D" && this.dynamite_tie_streak_threshold<3) {
            //     this.dynamite_tie_streak_threshold+=.05;
            // }
            this.streaks.push(this.tie_streak);
            // console.log(this.streaks.length, this.tie_streak)
            // console.log(this.streaks.reduce((p,c)=>{return p+c},0)/this.streaks.length);
            this.tie_streak = 0;
        }

        switch (last_enemy_move) { // refactor later: can we roll this into one/two ifs
            case "R":
                this.adjustWeights([1, 2, 3], [1+percent_modifier, 1-percent_modifier, 1-percent_modifier]);
                break;
            case "P":
                this.adjustWeights([2, 0, 3], [1+percent_modifier, 1-percent_modifier, 1-percent_modifier]);
                break;
            case "S":
                this.adjustWeights([0, 1, 3], [1+percent_modifier, 1-percent_modifier, 1-percent_modifier]);
                break;
            case "W":
                this.adjustWeights([4], [1-percent_modifier]);
                break;
            case "D":
                this.enemy_dynamite_count--;
                if (this.enemy_dynamite_count==0){
                    this.adjustWeights([3],[0]);
                }

                this.adjustWeights([3], [1+percent_modifier]);
                break;
        }


        // If we reached the tie threshold - pick dynamite (if we can), otherwise - roll for move using chooseMove()
        let pick_index = null;
        if (this.tie_streak >= this.water_tie_streak_threshold && this.enemy_dynamite_count > 0){
            pick_index = 3;
        }
        else if (this.tie_streak >= this.dynamite_tie_streak_threshold && this.dynamite_count > 0){
            pick_index = 4;
        } else {
            pick_index = this.chooseMove(this.throw_weights);
        }

        if (pick_index==4) {
            this.dynamite_count--;
            if (this.dynamite_count==0){
                // console.log("Ran out!", this.roundN, this.throw_weights);
                this.adjustWeights([4],[0]);
            }
        }
        
        
        // console.log(this.throw_weights);
        // console.log(this.dynamite_count, this.enemy_dynamite_count);
        
        return possible_throws
    [pick_index];
    }

    chooseMove(weights) {
        
        let random_roll = Math.random();
        let pick=0;
        while (random_roll>0){
            random_roll-=weights[pick];
            pick++;
        }
        return pick-1;

    }

    adjustWeights(indices, new_values) {

        for (let i=0; i<indices.length; i++) {
            this.throw_weights[indices[i]]*=new_values[i];
        }

        normalize_weights(this.throw_weights)

    }
}

module.exports = new Bot();

function normalize_weights(iterable){
    let sum = compute_sum(iterable);
    for (let i=0;i<iterable.length;i++){
        iterable[i]/=sum;
    }
}

function compute_sum(iterable){
    return iterable.reduce((p,c)=>{return p+c},0);
}