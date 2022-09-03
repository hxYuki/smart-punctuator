
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { processAll, processSingle } from './lib';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "smart-punctuator" is now active!');
	const config = vscode.workspace.getConfiguration("smartPunctuator");


	// let disposable = vscode.commands.registerCommand('smart-punctuator.convert', () => {
	// 	const e = vscode.window.activeTextEditor;
	// 	if (e) {
	// 		processAll(e.document);
	// 	}
	// });
	// context.subscriptions.push(disposable);

	if (config.convertOnType) {
		context.subscriptions.push(
			vscode.workspace.onDidChangeTextDocument(e => {
				processSingle(e);
			})
		);
	}

	// if (config.convertOnSave) {
	// 	context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(e => {
	// 		processAll(e.document);
	// 	}));
	// }
}

// this method is called when your extension is deactivated
export function deactivate() { }
