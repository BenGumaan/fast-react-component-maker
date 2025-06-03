import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { sanitizeComponentName } from './format';

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

export function generateComponentContent(
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

export async function createComponentFiles(
  name: string,
  targetFolder: string,
  useTS: boolean,
  withStyle: boolean,
  withIndex: boolean
) {
  
  const cleanName = sanitizeComponentName(name);
  const componentsPath = path.join(targetFolder, 'src', 'components');
  const folderPath = path.join(componentsPath, cleanName);
  await fs.mkdir(folderPath, { recursive: true });

  const { component, style, index } = generateComponentContent(cleanName, useTS, withStyle);
  const ext = useTS ? 'tsx' : 'jsx';
  const base = path.join(folderPath, cleanName);
  
  await checkAndWrite(`${base}.${ext}`, component);
  if (withStyle && style) {await checkAndWrite(`${base}.module.css`, style);}
  if (withIndex && index) {await checkAndWrite(path.join(folderPath, `index.${useTS ? 'ts' : 'js'}`), index);}
}
