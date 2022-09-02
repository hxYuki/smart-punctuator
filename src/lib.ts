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
const namePatterns = config.get("includeFilenamePattern") as string[];

export function processSingle(e: vscode.TextDocumentChangeEvent) {
    if (!namePatterns.includes(e.document.languageId)) { return; }

    for (const change of e.contentChanges) {
        if (prePuncs.has(change.text)) {

        }
    }
}

export function processAll(e: vscode.TextDocument) {
    if (!namePatterns.includes(e.languageId)) { return; }
}