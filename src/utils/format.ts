export function toPascalCase(input: string): string {
  return /^[A-Z][a-zA-Z0-9]*$/.test(input.trim()) 
    ? input.trim()
    : input
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .filter(Boolean)
      .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join('');
}

export function sanitizeComponentName(name: string): string {
  return toPascalCase(name).replace(/[^A-Za-z0-9]/g, '');
}

export function isValidComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name.trim());
}
