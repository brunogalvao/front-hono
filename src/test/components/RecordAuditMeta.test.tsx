import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecordAuditMeta } from '@/components/RecordAuditMeta';

describe('RecordAuditMeta', () => {
  it('identifies the creator and the latest editor', () => {
    render(
      <RecordAuditMeta
        creator={{ full_name: 'Ana Souza' }}
        editor={{ full_name: 'Bruno Lima' }}
        createdAt="2026-10-10T10:00:00.000Z"
        updatedAt="2026-10-11T10:00:00.000Z"
      />
    );

    expect(screen.getByText(/Criado por Ana Souza/)).toBeInTheDocument();
    expect(screen.getByText(/Editado por Bruno Lima/)).toBeInTheDocument();
  });

  it('does not claim an edit when creation and update timestamps are equal', () => {
    render(
      <RecordAuditMeta
        creator={{ full_name: 'Ana Souza' }}
        editor={null}
        createdAt="2026-10-10T10:00:00.000Z"
        updatedAt="2026-10-10T10:00:00.000Z"
      />
    );

    expect(screen.getByText(/Criado por Ana Souza/)).toBeInTheDocument();
    expect(screen.queryByText(/Atualizado/)).not.toBeInTheDocument();
  });

  it('labels legacy or system updates without fabricating an editor', () => {
    render(
      <RecordAuditMeta
        creator={{ full_name: 'Ana Souza' }}
        editor={null}
        createdAt="2026-10-10T10:00:00.000Z"
        updatedAt="2026-10-11T10:00:00.000Z"
      />
    );

    expect(screen.getByText(/Atualizado automaticamente/)).toBeInTheDocument();
  });
});
