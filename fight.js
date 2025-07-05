const bot1 = require('./AlphaBot.js');
const bot2 = require('./AlphaBot_v1.js');
// const bot2 = require('./SmartBotMk4.js');
const fs = require('node:fs');


function get_outcome(moves) {
    // returns the outcome of the round: bot1 win = +1, bot2 win = -1, draw = 0

    let legal_moves = ['R', 'P', 'S', 'W', 'D'];
    let outcomes = [[ 0, -1,  1,  1, -1],
                [ 1,  0, -1,  1, -1],
                [-1,  1,  0,  1, -1],
                [-1, -1, -1,  0,  1],
                [ 1,  1,  1, -1,  0]];

    let n1 = legal_moves.indexOf(moves[0]);
    let n2 = legal_moves.indexOf(moves[1]);

    return outcomes[n1][n2];
}


const max_rounds = 2500;
const point_threshold = 1000;

var points = [0, 0];
var gamestate1 = {rounds: []};
var gamestate2 = {rounds: []};
var gametext = "";
var tie_streak = 0;


for (let r=1; r<max_rounds+1; r++) {
    if (points[0] >= point_threshold || points[1] >= point_threshold) {break;}

    let move1 = bot1.makeMove(gamestate1);
    let move2 = bot2.makeMove(gamestate2);

    gamestate1.rounds.push({p1: move1, p2: move2});
    gamestate2.rounds.push({p1: move2, p2: move1});
    gametext = gametext + r + ": " + move1 + " - " + move2 + "\n";

    let outcome = get_outcome([move1, move2]);

    if (outcome == 0) {tie_streak++; continue;}
    else if (outcome == 1) {points[0] += tie_streak + 1;}
    else if (outcome == -1) {points[1] += tie_streak + 1;}

    tie_streak = 0;
}


fs.writeFile('./game.txt', gametext, err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});


if (points[0] > points[1]) {console.log("Bot 1 wins");}
else if (points[1] > points[0]) {console.log("Bot 2 wins");}
else {console.log("Tie");}