# TML Helper

A VS Code/Cursor extension to help with tModLoader development by generating code files from customizable templates.

## Features

- **Template-based file generation** - Generate tModLoader code files (ModItem, ModNPC, ModProjectile, etc.) from templates
- **Customizable templates** - Add your own templates in workspace or user directories
- **Multiple template sources** - Templates can be defined per-workspace or globally
- **Easy template management** - Quick access to open and manage your template folders

## Usage

### Generate a File from Template

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Generate File from Template"
3. Select a template from the list
4. Enter the class name (e.g., "MySword")
5. Enter the namespace (defaults to your workspace folder name)
6. Choose where to save the file

### Open Templates Folder

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Open Templates Folder"
3. This will create `.tml-helper/templates/` in your workspace if it doesn't exist and open it

## Adding Custom Templates

The extension looks for templates in three locations (in priority order):

1. **Workspace Templates** (`.tml-helper/templates/` in workspace root) - Project-specific, can be version-controlled
2. **User Global Templates** - Available across all projects
3. **Extension Templates** - Default templates bundled with the extension

### Creating a Template

1. Create a file with `.template` extension (e.g., `MyCustomItem.cs.template`)
2. Use template variables:
   - `${ClassName}` - Replaced with the class name you enter
   - `${Namespace}` - Replaced with the namespace you enter
3. Place it in your workspace `.tml-helper/templates/` folder or user templates folder

### Example Template

```csharp
using Terraria;
using Terraria.ModLoader;

namespace ${Namespace}
{
	public class ${ClassName} : ModItem
	{
		public override void SetDefaults()
		{
			Item.width = 20;
			Item.height = 20;
			// Your code here
		}
	}
}
```

## Default Templates

The extension comes with these default templates:

- **ModItem** - Basic ModItem template with SetDefaults and AddRecipes
- **ModNPC** - Basic ModNPC template with SetDefaults and SpawnChance
- **ModProjectile** - Basic ModProjectile template with SetDefaults and AI

## Requirements

- VS Code or Cursor version 1.105.0 or higher

## Extension Settings

This extension contributes the following commands:

- `tml-helper.generateFromTemplate` - Generate a file from a template
- `tml-helper.openTemplatesFolder` - Open the templates folder for editing

## Release Notes

### 0.0.1

Initial release of TML Helper
- Template-based file generation
- Support for workspace and user templates
- Default templates for ModItem, ModNPC, and ModProjectile
