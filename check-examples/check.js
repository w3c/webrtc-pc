const fs = require('fs');
const {spawn} = require('child_process');
const htmlparser = require('htmlparser2');
const Entities = require('html-entities').XmlEntities;

const entities = new Entities();
let isExampleText = false;
let exampleCounter = 0;
let nonPassingCounter = 0;

const parser = new htmlparser.Parser({
    onopentag: (tagName, attributes) => {
        if (tagName === 'pre' && 'class' in attributes && attributes.class.includes('example')) {
            isExampleText = true;
        }
    },
    ontext: (text) => {
        if (isExampleText) {
            checkExample(text);
            isExampleText = false;
        }
    },
}, {decodeEntities: false});

function printWithLineNumbers(str) {
    let count = 1;
    const out = str.replace(/^|\n/g, () => `\n${String(count++).padStart(3, '0')}  `);
    console.log(out);
}

function checkExample(tagText) {
    let text = entities.decode(tagText).trim();
    const testName = `Example_${++exampleCounter}`;
    const fileExt = text.includes('<script') ? 'html' : 'js';

    const check = spawn('node_modules/.bin/eslint', [
        '--stdin',
        '--stdin-filename',
        `${testName}.${fileExt}`, // A filename helps to load plugins
    ]);

    // ESLint doesn't seem to like anonymous objects
    if (text.startsWith('{') && text.endsWith('}')) {
        text = `temp = ${text};`;
    }

    check.stdin.setEncoding('utf-8');
    check.stdin.write(text);
    check.stdin.end();

    function printOutput(data) {
        console.log(`=== ${testName} ===`);
        printWithLineNumbers(text);
        console.log('=== Linter output ===');
        console.log(data.toString());
    }

    check.stdout.on('data', printOutput);
    check.stderr.on('data', printOutput);

    check.on('close', (code) => {
        if (code == 0) {
            console.log(`${testName}: Passed`);
        } else {
            console.error(`${testName}: Linter process exited with code ${code}\n`);
            nonPassingCounter++;
        }
        parser.resume();
    });

    parser.pause();
}

process.on('exit', (code) => {
    if (code) {
        return;
    }
    const message = nonPassingCounter == 0 ? 'All examples passed'
        : `${nonPassingCounter} of ${exampleCounter} examples did not pass`;
    console.log(`\nSummary: ${message}`);
    process.exitCode = nonPassingCounter;
});

const filenameIndex = process.argv[0].includes('node') ? 2 : 1;
if (process.argv.length < filenameIndex + 1) {
    console.warn('Missing filename');
    process.exit(1);
}

const filename = process.argv[filenameIndex];
fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
        console.error(err.toString());
        process.exit(1);
    }

    console.info(`Checking ${filename}`);
    parser.write(data);
    parser.end();
});
