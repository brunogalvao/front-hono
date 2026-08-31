import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

describe('DialogContent responsive behavior', () => {
  it('keeps long content scrollable inside the dynamic viewport', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Novo registro</DialogTitle>
          <DialogDescription>Preencha os dados</DialogDescription>
          <div>Conteúdo longo</div>
          <DialogFooter>
            <button type="button">Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-h-[calc(100dvh-2rem)]');
    expect(dialog).toHaveClass('overflow-y-auto');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeVisible();
  });
});
