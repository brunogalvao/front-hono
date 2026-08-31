import { Skeleton } from './ui/skeleton';

// Componente Skeleton para o formulário de rendimento
const IncomeFormSkeleton = () => (
  <div className="flex flex-col space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {['w-20', 'w-16', 'w-12'].map((labelWidth) => (
        <div key={labelWidth} className="flex min-w-0 flex-col space-y-3">
          <Skeleton className={`h-4 ${labelWidth}`} />
          <Skeleton className="h-11 w-full sm:h-10" />
        </div>
      ))}
      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Skeleton className="h-11 w-full lg:w-32" />
      </div>
    </div>
  </div>
);

// Componente Skeleton para a lista de rendimentos
const IncomeListSkeleton = () => (
  <div data-slot="collection-loading" className="rounded-lg border p-4 sm:p-6">
    <div className="mb-4">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="space-y-4">
      {/* Header da tabela */}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
        <Skeleton className="h-11 w-full sm:h-10 sm:w-64" />
        <Skeleton className="h-11 w-full sm:ml-auto sm:h-10 sm:w-32" />
      </div>

      <div className="space-y-3 md:hidden">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-32 max-w-[55%]" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex justify-end gap-2">
              <Skeleton className="size-11" />
              <Skeleton className="size-11" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-md border md:block">
        <div className="bg-muted/50 border-b px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="px-4 py-3">
              <div className="grid grid-cols-5 gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer com paginação */}
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Skeleton className="h-4 w-32 sm:flex-1" />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Skeleton className="h-11 w-full sm:h-8 sm:w-20" />
          <Skeleton className="h-11 w-full sm:h-8 sm:w-20" />
        </div>
      </div>
    </div>
  </div>
);

export { IncomeListSkeleton, IncomeFormSkeleton };
