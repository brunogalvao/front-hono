import * as React from 'react';
import { cn } from '@/lib/utils';

type MobileRecordListProps = React.ComponentProps<'ul'> & {
  emptyState?: React.ReactNode;
};

function MobileRecordList({
  children,
  className,
  emptyState = null,
  ...props
}: MobileRecordListProps) {
  if (React.Children.count(children) === 0) {
    return emptyState;
  }

  return (
    <ul
      data-slot="mobile-record-list"
      className={cn('grid min-w-0 gap-3', className)}
      {...props}
    >
      {children}
    </ul>
  );
}

function MobileRecordListItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="mobile-record-list-item"
      className={cn(
        'bg-card text-card-foreground min-w-0 rounded-lg border p-4 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export { MobileRecordList, MobileRecordListItem };
