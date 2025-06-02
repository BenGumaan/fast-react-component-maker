import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

const config = vscode.workspace.getConfiguration('reactComponentGenerator');
const defaultTS = config.get<boolean>('useTypeScript', false);
const defaultStyle = config.get<boolean>('includeCssModule', false);
const defaultIndex = config.get<boolean>('createIndexFile', false);

function generateComponentContent(
  name: string,
  useTS: boolean,
  withStyle: boolean
) {
  const styleImport = withStyle ? `import styles from './${name}.module.css';\n\n` : '';
  const classAttr = withStyle ? `className={styles.container}` : '';

  const component = 
  `${styleImport}import React${useTS ? ', { FC }' : ''} from 'react';

  const ${name}${useTS ? ': FC' : ''} = () => {
    return (
      <div ${classAttr}>
        ${name} component
      </div>
    );
  };

  export default ${name};`;

  const style = withStyle ? `.container {\n  /* Styles for ${name} */\n}\n` : undefined;
  const index = `export { default } from './${name}';\n`;

  return { component, style, index };

}

async function createComponentFiles(
  name: string,
  targetFolder: string,
  useTS: boolean,
  withStyle: boolean,
  withIndex: boolean
) {

  const componentsPath = path.join(targetFolder, 'src', 'components');
  const folderPath = path.join(componentsPath, name);
  await fs.mkdir(folderPath, { recursive: true });

  const { component, style, index } = generateComponentContent(name, useTS, withStyle);
  const ext = useTS ? 'tsx' : 'jsx';
  const base = path.join(folderPath, name);
  
  async function getAvailableFilename(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    let counter = 1;
    let newPath = path.join(dir, `${base}(${counter})${ext}`);

    while (true) {
      try {
        await fs.access(newPath);
        newPath = path.join(dir, `${base}(${++counter})${ext}`);
      } catch {
        break;
      }
    }

    return newPath;
  }

  async function checkAndWrite(filePath: string, content: string) {
    try {
      await fs.access(filePath);
      const confirm = await vscode.window.showWarningMessage(
        `File ${filePath} exists. Overwrite?`,
        'Yes', 'No'
      );
      if (confirm !== 'Yes') {
        filePath = await getAvailableFilename(filePath);
      } else {
        await fs.copyFile(filePath, `${filePath}.bak`);
      }
    } catch {}

    try {
      await fs.writeFile(filePath, content, 'utf8');
      vscode.window.showInformationMessage(`✅ Created ${filePath}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`❌ Failed to write file: ${err.message}`);
    }
  }

  await checkAndWrite(`${base}.${ext}`, component);
  if (withStyle && style) {await checkAndWrite(`${base}.module.css`, style);}
  if (withIndex && index) {await checkAndWrite(path.join(folderPath, `index.${useTS ? 'ts' : 'js'}`), index);}
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.createReactComponent', async () => {

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders?.length) {
      return vscode.window.showErrorMessage('Open a workspace first.');
    }
    const rootPath = workspaceFolders[0].uri.fsPath;

    function toPascalCase(input: string): string {
      return /^[A-Z][a-zA-Z0-9]*$/.test(input.trim()) 
        ? input.trim()
        : input
          .replace(/[_\-.]+/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/[^a-zA-Z0-9]/g, '')
          .split(' ')
          .filter(Boolean)
          .map(word => word [0].toUpperCase() + word .slice(1).toLowerCase())
          .join('');
    }

    let componentName = await vscode.window.showInputBox({
      prompt: 'Enter React component name (PascalCase - e.g., MyComponent)',
      placeHolder: 'MyComponent',
    });

    if (!componentName) {
      return vscode.window.showErrorMessage('Component name is required.');
    }
    
    componentName = toPascalCase(componentName.trim());

    while (true) {
      const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: `Use component name '${componentName}'? (Choose Yes to proceed, No to rename)`,
      });
      if (confirm !== 'Yes') {
        const edited = await vscode.window.showInputBox({
          prompt: 'Edit component name',
          value: componentName,
        });
        if (!edited) {return;}
        componentName = toPascalCase(edited.trim());
      } else {
        break;
      }
    }

    const useTS = (await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Use TypeScript?',
    })) === 'Yes' || defaultTS;

    const withStyle = (await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Include CSS Module?',
    })) === 'Yes' || defaultStyle;

    const withIndex = (await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Create index file?',
    })) === 'Yes' || defaultIndex;

    await createComponentFiles(componentName, rootPath, useTS, withStyle, withIndex);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
