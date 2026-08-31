import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MobileRecordList,
  MobileRecordListItem,
} from '@/components/ui/mobile-record-list';

describe('MobileRecordList', () => {
  it('uses list semantics without imposing domain fields', () => {
    render(
      <MobileRecordList aria-label="Transações">
        <MobileRecordListItem>Registro livre</MobileRecordListItem>
      </MobileRecordList>
    );

    expect(
      screen.getByRole('list', { name: 'Transações' })
    ).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Registro livre');
  });

  it('renders the supplied empty state without an empty list', () => {
    render(
      <MobileRecordList emptyState={<p>Nenhum registro</p>}>
        {null}
      </MobileRecordList>
    );

    expect(screen.getByText('Nenhum registro')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
