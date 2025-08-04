import { Skeleton } from './ui/skeleton';

// Componente Skeleton para o formulário de rendimento
const IncomeFormSkeleton = () => (
  <div className="flex flex-col space-y-6">
    {/* Primeira linha: Descrição e Salário */}
    <div className="flex flex-row gap-3">
      <div className="flex w-full flex-col space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex w-full flex-col space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Segunda linha: Mês, Ano e Botão */}
    <div className="flex flex-row gap-3">
      <div className="flex w-full flex-col space-y-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex w-full flex-col space-y-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex items-end">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);

// Componente Skeleton para a lista de rendimentos
const IncomeListSkeleton = () => (
  <div className="rounded-lg border p-6">
    <div className="mb-4">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="space-y-4">
      {/* Header da tabela */}
      <div className="flex items-center py-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="ml-auto h-10 w-32" />
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-4 w-32 flex-1" />
        <div className="space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export { IncomeListSkeleton, IncomeFormSkeleton };
