import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Template {
	name: string;
	filePath: string;
	displayName: string;
	source: 'workspace' | 'user' | 'extension';
}

export class TemplateManager {
	private extensionTemplatesPath: string;
	private context: vscode.ExtensionContext;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		// Extension templates (read-only, bundled with extension)
		this.extensionTemplatesPath = path.join(context.extensionPath, 'templates');
	}

	/**
	 * Get workspace templates directory
	 */
	private getWorkspaceTemplatesPath(): string | null {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return null;
		}

		// Check for .tml-helper/templates/ first (hidden folder)
		const hiddenPath = path.join(workspaceFolder.uri.fsPath, '.tml-helper', 'templates');
		if (fs.existsSync(hiddenPath)) {
			return hiddenPath;
		}

		// Check for templates/ in workspace root
		const rootPath = path.join(workspaceFolder.uri.fsPath, 'templates');
		if (fs.existsSync(rootPath)) {
			return rootPath;
		}

		return null;
	}

	/**
	 * Get user global templates directory
	 */
	private getUserTemplatesPath(): string {
		// Use extension's global storage path
		const globalStoragePath = this.context.globalStorageUri.fsPath;
		const userTemplatesPath = path.join(globalStoragePath, 'templates');
		
		// Create directory if it doesn't exist
		if (!fs.existsSync(userTemplatesPath)) {
			fs.mkdirSync(userTemplatesPath, { recursive: true });
		}

		return userTemplatesPath;
	}

	/**
	 * Get all available templates from all sources
	 */
	public getTemplates(): Template[] {
		const templates: Template[] = [];
		const seenNames = new Set<string>();

		// Priority order: workspace > user > extension
		// This allows users to override extension templates

		// 1. Workspace templates (highest priority)
		const workspacePath = this.getWorkspaceTemplatesPath();
		if (workspacePath) {
			this.loadTemplatesFromPath(workspacePath, 'workspace', templates, seenNames);
		}

		// 2. User global templates
		const userPath = this.getUserTemplatesPath();
		this.loadTemplatesFromPath(userPath, 'user', templates, seenNames);

		// 3. Extension templates (lowest priority, only if not overridden)
		if (fs.existsSync(this.extensionTemplatesPath)) {
			this.loadTemplatesFromPath(this.extensionTemplatesPath, 'extension', templates, seenNames);
		}

		return templates.sort((a, b) => a.displayName.localeCompare(b.displayName));
	}

	/**
	 * Load templates from a specific path
	 */
	private loadTemplatesFromPath(
		templatesPath: string,
		source: 'workspace' | 'user' | 'extension',
		templates: Template[],
		seenNames: Set<string>
	): void {
		if (!fs.existsSync(templatesPath)) {
			return;
		}

		try {
			const files = fs.readdirSync(templatesPath);
			
			for (const file of files) {
				if (file.endsWith('.template')) {
					const displayName = this.getDisplayName(file);
					
					// Skip if we've already seen this template name (workspace/user override extension)
					if (seenNames.has(displayName)) {
						continue;
					}

					const filePath = path.join(templatesPath, file);
					templates.push({
						name: file,
						filePath: filePath,
						displayName: displayName,
						source: source
					});

					seenNames.add(displayName);
				}
			}
		} catch (error) {
			console.error(`Error loading templates from ${templatesPath}:`, error);
		}
	}

	/**
	 * Get display name from template filename
	 * e.g., "ModItem.cs.template" -> "ModItem"
	 */
	private getDisplayName(filename: string): string {
		// Remove .template extension and file extension
		let name = filename.replace(/\.template$/, '');
		// Remove file extension (e.g., .cs)
		const lastDot = name.lastIndexOf('.');
		if (lastDot > 0) {
			name = name.substring(0, lastDot);
		}
		return name;
	}

	/**
	 * Read template content
	 */
	public readTemplate(templatePath: string): string {
		return fs.readFileSync(templatePath, 'utf8');
	}

	/**
	 * Replace template variables with actual values
	 */
	public processTemplate(content: string, variables: Record<string, string>): string {
		let processed = content;
		
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
			processed = processed.replace(regex, value);
		}

		return processed;
	}

	/**
	 * Get default namespace from workspace
	 */
	public async getDefaultNamespace(): Promise<string> {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return 'MyMod';
		}

		// Try to read from a .csproj file or use folder name
		const folderName = path.basename(workspaceFolder.uri.fsPath);
		// Convert to valid C# namespace (remove spaces, special chars)
		return folderName.replace(/[^a-zA-Z0-9]/g, '') || 'MyMod';
	}

	/**
	 * Get the user templates directory path (public method for opening in explorer)
	 */
	public getUserTemplatesDirectory(): string {
		return this.getUserTemplatesPath();
	}

	/**
	 * Get the workspace templates directory path (public method for opening in explorer)
	 */
	public getWorkspaceTemplatesDirectory(): string | null {
		return this.getWorkspaceTemplatesPath();
	}

	/**
	 * Ensure workspace templates directory exists
	 */
	public ensureWorkspaceTemplatesDirectory(): string | null {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return null;
		}

		// Use .tml-helper/templates/ (hidden folder)
		const templatesPath = path.join(workspaceFolder.uri.fsPath, '.tml-helper', 'templates');
		
		if (!fs.existsSync(templatesPath)) {
			fs.mkdirSync(templatesPath, { recursive: true });
		}

		return templatesPath;
	}
}

