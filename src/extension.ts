import * as vscode from 'vscode';
import { createComponentFiles } from './utils/fileWriter';
import { isValidComponentName, toPascalCase } from './utils/format';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.createReactComponent', async () => {

    const config = vscode.workspace.getConfiguration('reactComponentGenerator');
    const defaultTS = config.get<boolean>('useTypeScript', false);
    const defaultStyle = config.get<boolean>('includeCssModule', false);
    const defaultIndex = config.get<boolean>('createIndexFile', false);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders?.length) {
      return vscode.window.showErrorMessage('Open a workspace first.');
    }
    const rootPath = workspaceFolders[0].uri.fsPath;

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
          prompt: 'Edit component name (PascalCase only)',
          value: componentName,
        });
        if (!edited) {return;}
        componentName = toPascalCase(edited.trim());
        if (!isValidComponentName(componentName)) {
          vscode.window.showErrorMessage('Component name must be in PascalCase. Please try again.');
          continue;
        }
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
