/* eslint-disable curly */
import { off } from 'process';
import * as vscode from 'vscode';

/* eslint-disable @typescript-eslint/naming-convention */
const prePuncs = new Map([
    [',', '，'],
    ['.', '。'],
    ['/', '、'],
    [':', '：'],
    [';', '；'],
    [']', '】'],
    [')', '）'],
    ['!', '！'],
    ['>', '》'],

    ['，', ','],
    ['。', '.'],
    ['、', '/'],
    ['：', ':'],
    ['；', ';'],
    ['】', ']'],
    ['）', ')'],
    ['！', '!'],
    ['》', '>'],

    ['’', '\''],
    ['”', '\"']

]);
const postPunc = new Map([
    ['[', '【'],
    ['(', '（'],
    ['<', '《'],

    ['【', '['],
    ['（', '('],
    ['《', '<'],

    ['‘', '\''],
    ['“', '\"']
]);

const pairPunc = new Map([
    ['\'', ['‘', '’']],
    ['\"', ['“', '”']],
]);
/* eslint-enable @typescript-eslint/naming-convention */

const config = vscode.workspace.getConfiguration("smartPunctuator");
const namePatterns = config.includeLanguage as string[];

const pattern = new RegExp("([\u4E00-\u9FFF]|[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\u3010\u3011\uffe5‘’”“])+");

function isChineseCharacter(char: string) {
    return pattern.test(char);
}
function getPredecessor(p: vscode.Position) {
    return p.character === 0 ? p : p.translate(0, -1);
}
function getSuccessor(p: vscode.Position) {
    return p.translate(0, 1);
}


const quotes = new RegExp(/['‘’]|["“”]/g);
export function processSingle(e: vscode.TextDocumentChangeEvent) {
    if (!namePatterns.includes(e.document.languageId)) { return; }

    for (const change of e.contentChanges) {
        const prev = change.range.with(getPredecessor(change.range.start), (change.range.start));
        const prevC = e.document.getText(prev);
        const curr = change.range.with((change.range.start), (change.range.start.translate(0, change.text.length)));
        const currC = e.document.getText(curr); // === change.text
        const succ = e.document.validateRange(curr.with((curr.end), getSuccessor(curr.end)));
        const succC = e.document.getText(succ);

        const head2prev = prev.with(prev.start.with(undefined, 0));
        const head2prevStr = e.document.getText(head2prev);

        const q = [...head2prevStr.matchAll(quotes)];
        let singleCount = 0; let singleLast: RegExpMatchArray;
        let doubleCount = 0; let doubleLast: RegExpMatchArray;
        q.forEach(match => {
            switch (match[0]) {
                case '\'':
                case '‘':
                case '’':
                    singleCount++;
                    singleLast = match;
                    break;
                case '\"':
                case '“':
                case '”':
                    doubleCount++;
                    doubleLast = match;
                    break;
            }
        });


        console.log('prev', [prev.start.character, prev.end.character], prevC, isChineseCharacter(prevC));
        console.log('curr', [curr.start.character, curr.end.character], currC, isChineseCharacter(currC));
        console.log('succ', [succ.start.character, succ.end.character], succC, isChineseCharacter(succC));

        vscode.window.activeTextEditor?.edit(e => {
            // punctuations follow the char before
            if (prevC && prePuncs.has(currC))
                if (isChineseCharacter(currC) !== isChineseCharacter(prevC)) {
                    e.replace(curr, prePuncs.get(currC)!);
                    console.log("punch 1");
                }
            // punctuations follow the char before, when insert character before punctuation
            if (currC && succC && prePuncs.has(succC))
                if (isChineseCharacter(succC) !== isChineseCharacter(currC)) {
                    e.replace(succ, prePuncs.get(succC)!);
                    console.log("punch 2");
                }
            // punctuations follow the following char
            if (currC && postPunc.has(prevC))
                if (isChineseCharacter(currC) !== isChineseCharacter(prevC)) {
                    e.replace(prev, postPunc.get(prevC)!);
                    console.log("punch 3");
                }

            // quotes when converting from ASCII quotes
            if (singleCount % 2 && (singleLast[0] === '\'' || singleLast[0] === '‘')) {
                if (currC === '\'' || currC === '‘') {
                    if (singleLast[0] === '\'') {
                        const lastQuote = curr.start.with(undefined, singleLast.index);
                        const lastQuoteRange = curr.with(lastQuote, getSuccessor(lastQuote));
                        e.replace(lastQuoteRange, '‘');
                    }
                    e.replace(curr, '’');
                }
            }
            if (doubleCount % 2 && (doubleLast[0] === '\"' || doubleLast[0] === '“')) {
                if (currC === '\"' || currC === '“') {
                    if (doubleLast[0] === '\"') {
                        const lastQuote = curr.start.with(undefined, doubleLast.index);
                        const lastQuoteRange = curr.with(lastQuote, getSuccessor(lastQuote));
                        e.replace(lastQuoteRange, '“');
                    }
                    e.replace(curr, '”');
                }
            }
            console.log('punched');
        });
    }
}

export function processAll(e: vscode.TextDocument) {
    if (!namePatterns.includes(e.languageId)) { return; }
}