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
const namePatterns = config.get("includeFilenamePattern") as string[] ?? ['markdown'];

const pattern = new RegExp("([\u4E00-\u9FFF]|[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\u3010\u3011\uffe5])+");
function isChineseCharacter(char: string) {
    return pattern.test(char);
}
function getPredecessor(p: vscode.Position) {
    return p.character === 0 ? p : p.translate(0, -1);
}
function getSuccessor(p: vscode.Position) {
    return p.translate(0, 1);
}

export function processSingle(e: vscode.TextDocumentChangeEvent) {
    if (!namePatterns.includes(e.document.languageId)) { return; }

    for (const change of e.contentChanges) {
        const prev = change.range.with(getPredecessor(change.range.start), (change.range.start));
        const prevC = e.document.getText(prev);
        const curr = change.range.with((change.range.start), (change.range.start.translate(0, change.text.length)));
        const currC = e.document.getText(curr); // === change.text
        const succ = e.document.validateRange(curr.with((curr.end), getSuccessor(curr.end)));
        const succC = e.document.getText(succ);
        console.log('prev', [prev.start.character, prev.end.character], prevC, isChineseCharacter(prevC));
        console.log('curr', [curr.start.character, curr.end.character], currC, isChineseCharacter(currC));
        console.log('succ', [succ.start.character, succ.end.character], succC, isChineseCharacter(succC));

        vscode.window.activeTextEditor?.edit(e => {
            if (prePuncs.has(currC))
                if (isChineseCharacter(currC) !== isChineseCharacter(prevC))
                    e.replace(curr, prePuncs.get(currC)!);

            if (succC && prePuncs.has(succC))
                if (isChineseCharacter(succC) !== isChineseCharacter(currC))
                    e.replace(succ, prePuncs.get(succC)!);

            if (postPunc.has(prevC))
                if (isChineseCharacter(currC) !== isChineseCharacter(prevC))
                    e.replace(prev, postPunc.get(prevC)!)

            console.log('punched');
        });
    }
}

export function processAll(e: vscode.TextDocument) {
    if (!namePatterns.includes(e.languageId)) { return; }
}