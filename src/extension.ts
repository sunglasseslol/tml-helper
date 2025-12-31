// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { TemplateManager } from './templateManager';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	try {
		// Use the console to output diagnostic information (console.log) and errors (console.error)
		// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "tml-helper" is now active!');

		const templateManager = new TemplateManager(context);

		// Register the template generation command
		const generateCommand = vscode.commands.registerCommand('tml-helper.generateFromTemplate', async () => {
			try {
				// Get available templates
				const templates = templateManager.getTemplates();
				
				if (templates.length === 0) {
					const action = await vscode.window.showWarningMessage(
						'No templates found. Would you like to open the templates folder?',
						'Open Templates Folder'
					);
					if (action === 'Open Templates Folder') {
						await vscode.commands.executeCommand('tml-helper.openTemplatesFolder');
					}
					return;
				}

				// Let user select a template
				const templateOptions = templates.map(t => ({
					label: t.displayName,
					description: `${t.name} (${t.source})`,
					template: t
				}));

				const selected = await vscode.window.showQuickPick(templateOptions, {
					placeHolder: 'Select a template to generate from...'
				});

				if (!selected) {
					return; // User cancelled
				}

				// Get the class name from user
				const className = await vscode.window.showInputBox({
					prompt: 'Enter the class name (e.g., MySword)',
					placeHolder: 'ClassName',
					validateInput: (value) => {
						if (!value || value.trim().length === 0) {
							return 'Class name cannot be empty';
						}
						if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
							return 'Invalid class name. Must start with a letter or underscore.';
						}
						return null;
					}
				});

				if (!className) {
					return; // User cancelled
				}

				// Get namespace (with default)
				const defaultNamespace = await templateManager.getDefaultNamespace();
				const namespace = await vscode.window.showInputBox({
					prompt: 'Enter the namespace',
					placeHolder: defaultNamespace,
					value: defaultNamespace
				}) || defaultNamespace;

				// Get target directory
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				if (!workspaceFolder) {
					vscode.window.showErrorMessage('No workspace folder open.');
					return;
				}

				// Ask user where to save the file
				const targetUri = await vscode.window.showSaveDialog({
					defaultUri: vscode.Uri.joinPath(workspaceFolder.uri, `${className}.cs`),
					filters: {
						'C# Files': ['cs']
					}
				});

				if (!targetUri) {
					return; // User cancelled
				}

				// Read and process template
				const templateContent = templateManager.readTemplate(selected.template.filePath);
				const processedContent = templateManager.processTemplate(templateContent, {
					ClassName: className,
					Namespace: namespace
				});

				// Write the file
				fs.writeFileSync(targetUri.fsPath, processedContent, 'utf8');

				// Open the new file
				const document = await vscode.workspace.openTextDocument(targetUri);
				await vscode.window.showTextDocument(document);

				vscode.window.showInformationMessage(`Created ${className} from ${selected.label} template!`);
			} catch (error) {
				console.error('Error generating from template:', error);
				vscode.window.showErrorMessage(`Failed to generate file: ${error}`);
			}
		});

		// Command to open templates folder
		const openTemplatesCommand = vscode.commands.registerCommand('tml-helper.openTemplatesFolder', async () => {
			try {
				const workspacePath = templateManager.getWorkspaceTemplatesDirectory();
				const userPath = templateManager.getUserTemplatesDirectory();

				if (workspacePath) {
					// Open workspace templates folder
					const uri = vscode.Uri.file(workspacePath);
					await vscode.commands.executeCommand('revealFileInOS', uri);
					vscode.window.showInformationMessage(`Opened workspace templates folder: ${workspacePath}`);
				} else {
					// Create and open workspace templates folder
					const createdPath = templateManager.ensureWorkspaceTemplatesDirectory();
					if (createdPath) {
						const uri = vscode.Uri.file(createdPath);
						await vscode.commands.executeCommand('revealFileInOS', uri);
						vscode.window.showInformationMessage(`Created and opened workspace templates folder: ${createdPath}`);
					} else {
						// Fall back to user templates
						const uri = vscode.Uri.file(userPath);
						await vscode.commands.executeCommand('revealFileInOS', uri);
						vscode.window.showInformationMessage(`Opened user templates folder: ${userPath}`);
					}
				}
			} catch (error) {
				console.error('Error opening templates folder:', error);
				vscode.window.showErrorMessage(`Failed to open templates folder: ${error}`);
			}
		});

		// Keep the hello world command for now
		const helloCommand = vscode.commands.registerCommand('tml-helper.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from TML Helper!');
		});

		context.subscriptions.push(generateCommand, openTemplatesCommand, helloCommand);
		console.log('Extension "tml-helper" commands registered successfully');
	} catch (error) {
		console.error('Error activating extension:', error);
		vscode.window.showErrorMessage(`Failed to activate tml-helper: ${error}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
