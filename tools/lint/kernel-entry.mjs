import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
const integrationRoot = path.join(workspaceRoot, 'libs/shared/kernel/src/angular');

/** Check actual relative paths, including type-only and lazy references between kernel entries. */
export const kernelEntry = {
  meta: {
    type: 'problem',
    schema: [{ enum: ['angular'] }],
    messages: {
      restricted: 'Restricted import across the shared kernel framework boundary: {{name}}.',
    },
  },
  create(context) {
    const integration = context.options[0] === 'angular';
    function check(node) {
      const source = node.source ?? node.expression;
      const name =
        source?.type === 'TemplateLiteral' && source.expressions.length === 0
          ? source.quasis[0].value.cooked
          : source?.value;
      if (typeof name !== 'string') return;

      const target = path.resolve(
        name.startsWith('.') ? path.dirname(context.filename) : workspaceRoot,
        name,
      );
      const angularEntry =
        /^@(?:shared|showtime\/shared)\/kernel\/(?:src\/)?angular(?:\/|$)/.test(name) ||
        target === integrationRoot ||
        target.startsWith(integrationRoot + path.sep);
      // no-restricted-imports handles framework packages in static imports and re-exports.
      const inlineFramework =
        ['ImportExpression', 'TSImportType', 'TSExternalModuleReference'].includes(node.type) &&
        /^(?:@angular\/|rxjs(?:\/|$))/.test(name);
      const coreAllowed =
        integration &&
        (name === '@angular/core' ||
          (name === '@angular/core/testing' && context.filename.endsWith('.spec.ts')));
      if ((!integration && angularEntry) || (inlineFramework && !coreAllowed)) {
        context.report({ node, messageId: 'restricted', data: { name } });
      }
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
