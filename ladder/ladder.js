var parse_json = false;

var Ladder = require( './ladder-diagram' );
var LadderParse = require( './ladder-parser');
var fs = require('fs');
var data, parsed, output;

if (process.argv[2] === '-d') {
    require('./debug').enable();
    process.argv.shift();
}

data = fs.readFileSync(process.argv[2], 'utf8');
parsed = LadderParse.parse(data);
Ladder.compute_ladder(parsed);
output = Ladder.draw_ladder();
if (process.argv[3]) {
    fs.writeFileSync(process.argv[3], output);
} else {
    console.log(output);
}
