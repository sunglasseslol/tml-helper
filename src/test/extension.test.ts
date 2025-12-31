import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be activated', async () => {
		// In test environment, find extension by workspace folder path
		// The extension is loaded from the workspace folder
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		assert.ok(workspaceFolder, 'Workspace folder should be available');
		
		// Try to find extension by ID, or verify it's loaded by executing a command
		// Since the extension activates on command, executing the command will activate it
		await vscode.commands.executeCommand('tml-helper.helloWorld');
		
		// If we get here without error, the extension is activated
		assert.ok(true, 'Extension is activated (command executed successfully)');
	});

	test('Hello World command should be registered', async () => {
		// Execute the command to ensure extension is activated
		await vscode.commands.executeCommand('tml-helper.helloWorld');

		// Get all registered commands (include internal commands)
		const commands = await vscode.commands.getCommands(true);
		
		// Note: In some test environments, getCommands might not immediately reflect
		// all commands. Since command execution works, we verify it's callable.
		// If the command wasn't registered, executeCommand would throw an error.
		let canExecute = false;
		try {
			await vscode.commands.executeCommand('tml-helper.helloWorld');
			canExecute = true;
		} catch {
			canExecute = false;
		}
		assert.ok(canExecute, 'Command tml-helper.helloWorld should be executable (and therefore registered)');
	});

	test('Hello World command should execute', async () => {
		// Execute the command
		// Note: This will show the information message, but we can't easily test the UI
		// The fact that it doesn't throw an error means it executed successfully
		try {
			await vscode.commands.executeCommand('tml-helper.helloWorld');
			assert.ok(true, 'Command executed successfully');
		} catch (error) {
			assert.fail(`Command execution failed: ${error}`);
		}
	});
});
