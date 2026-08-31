import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const files = [
  'src/components/workspace/PermissionMatrix.tsx',
  'src/components/workspace/GuestPermissionEditor.tsx',
];

describe('permission matrix overflow containment', () => {
  it.each(files)(
    '%s exposes an accessible, keyboard reachable scroll region',
    (file) => {
      const source = readFileSync(file, 'utf8');
      expect(source).toContain('role="region"');
      expect(source).toContain('tabIndex={0}');
      expect(source).toContain("t('matrix.scrollHint')");
      expect(source).toContain('max-w-full overflow-x-auto');
    }
  );
});
