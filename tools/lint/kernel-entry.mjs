import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
const config = ts.readConfigFile(path.join(workspaceRoot, 'tsconfig.base.json'), ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, workspaceRoot).options;
const framework = /^(?:@angular\/|rxjs(?:\/|$))/;

/** Follow selected exports through barrels, then every dependency of their implementation. */
export function reachesFramework(name, from, names = ['*'], visited = new Set()) {
  if (framework.test(name)) return true;
  const resolved = ts.resolveModuleName(name, from, options, ts.sys).resolvedModule;
  if (!resolved) return /kernel\/angular(?:\/|$)/.test(name);
  const file = resolved.resolvedFileName;
  if (!file.startsWith(workspaceRoot) || file.includes(`${path.sep}node_modules${path.sep}`)) return false;
  const key = `${file}:${names.join(',')}`;
  if (visited.has(key)) return false;
  visited.add(key);
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const selected = new Set(names);
  const all = selected.has('*');
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
      let exports = ['*'];
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        exports = statement.exportClause.elements
          .filter(item => all || selected.has(item.name.text))
          .map(item => (item.propertyName ?? item.name).text);
      }
      if (exports.length && reachesFramework(statement.moduleSpecifier.text, file, exports, visited)) return true;
    } else if (ts.isImportDeclaration(statement)) {
      const bindings = statement.importClause?.namedBindings;
      const imports = bindings && ts.isNamedImports(bindings)
        ? bindings.elements.map(item => (item.propertyName ?? item.name).text)
        : ['*'];
      if (reachesFramework(statement.moduleSpecifier.text, file, imports, visited)) return true;
    } else {
      let forbidden = false;
      function visit(node) {
        if (ts.isStringLiteralLike(node) &&
          ((ts.isCallExpression(node.parent) && node.parent.expression.kind === ts.SyntaxKind.ImportKeyword) ||
           ts.isLiteralTypeNode(node.parent) && ts.isImportTypeNode(node.parent.parent)) &&
          reachesFramework(node.text, file, ['*'], visited)) forbidden = true;
        ts.forEachChild(node, visit);
      }
      visit(statement);
      if (forbidden) return true;
    }
  }
  return false;
}

/** Enforce symbol-level purity while allowing a unified public kernel barrel. */
export const kernelEntry = {
  meta: {
    type: 'problem',
    schema: [{ enum: ['angular', 'barrel'] }],
    messages: { restricted: 'Restricted import across the shared kernel framework boundary: {{name}}.' },
  },
  create(context) {
    const mode = context.options[0];
    function check(node) {
      const source = node.source ?? node.expression;
      const name = source?.type === 'TemplateLiteral' && source.expressions.length === 0
        ? source.quasis[0].value.cooked : source?.value;
      if (typeof name !== 'string') return;
      const coreAllowed = mode === 'angular' && (name === '@angular/core' ||
        name === '@angular/core/testing' && context.filename.endsWith('.spec.ts'));
      let names = ['*'];
      if (node.specifiers?.length && node.specifiers.every(item =>
        item.type === 'ImportSpecifier' || item.type === 'ExportSpecifier')) {
        names = node.specifiers.map(item => (item.imported ?? item.local).name ?? (item.imported ?? item.local).value);
      }
      const forbidden = framework.test(name) ? !coreAllowed :
        !mode && reachesFramework(name, context.filename, names);
      if (forbidden) context.report({ node, messageId: 'restricted', data: { name } });
    }
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
      TSImportType: check,
      TSExternalModuleReference: check,
    };
  },
};
