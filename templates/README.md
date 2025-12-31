# TML Helper Templates

This directory contains default template files bundled with the extension. **Users should not modify this directory directly.**

## How to Use

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Generate File from Template"
3. Select a template from the list
4. Enter the class name (e.g., "MySword")
5. Enter the namespace (defaults to your workspace folder name)
6. Choose where to save the file

## Adding Your Own Templates

The extension looks for templates in **three locations** (in priority order):

### 1. Workspace Templates (Recommended)
**Location:** `.tml-helper/templates/` in your workspace root (hidden folder)

This is the best place for project-specific templates. They're version-controlled with your project.

**To add templates:**
- Press `Cmd+Shift+P` / `Ctrl+Shift+P`
- Type "Open Templates Folder"
- This will create `.tml-helper/templates/` if it doesn't exist and open it
- Add your `.template` files there

### 2. User Global Templates
**Location:** Extension's global storage (automatically created)

These templates are available across all your projects.

**To add templates:**
- The folder is automatically created when you first use the extension
- On Mac: `~/Library/Application Support/Cursor/User/globalStorage/tml-helper/templates/`
- On Windows: `%APPDATA%\Cursor\User\globalStorage\tml-helper\templates\`
- On Linux: `~/.config/Cursor/User/globalStorage/tml-helper/templates/`

### 3. Extension Templates (Default)
**Location:** This directory (read-only, bundled with extension)

These are the default templates that come with the extension. You can override them by creating templates with the same name in workspace or user folders.

## Creating Custom Templates

1. Create a new file with `.template` extension
2. Name it: `YourTemplateName.cs.template` (or any extension + `.template`)
3. Use template variables:
   - `${ClassName}` - Will be replaced with the class name you enter
   - `${Namespace}` - Will be replaced with the namespace you enter

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

## Available Default Templates

- **ModItem** - Basic ModItem template with SetDefaults and AddRecipes
- **ModNPC** - Basic ModNPC template with SetDefaults and SpawnChance
- **ModProjectile** - Basic ModProjectile template with SetDefaults and AI

## Template Priority

If you create a template with the same name in multiple locations, the priority is:
1. **Workspace templates** (highest priority)
2. **User global templates**
3. **Extension templates** (lowest priority)

This means you can override the default templates by creating your own versions.

## Template Variables

- `${ClassName}` - The class name entered by the user
- `${Namespace}` - The namespace (defaults to workspace folder name)

You can add more variables by modifying the template processing in `src/extension.ts`.

