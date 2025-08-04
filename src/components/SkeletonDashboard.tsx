import { Skeleton } from './ui/skeleton';

// Componente Skeleton para as dicas de economia
const TipsSkeleton = () => (
  <div className="rounded-lg border p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para o status financeiro
const StatusSkeleton = () => (
  <div className="rounded-lg border p-6">
    <div className="mb-4 flex items-center gap-3">
      <Skeleton className="h-6 w-6" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
      {[1, 2, 3, 4].map((index) => (
        <div key={index}>
          <Skeleton className="mb-1 h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para o resumo financeiro
const SummarySkeleton = () => (
  <div className="rounded-lg border p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <div key={index} className="bg-muted/50 rounded-lg p-4 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-24" />
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para conversão de dólar
const DollarConversionSkeleton = () => (
  <div className="rounded-lg border p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="text-right">
        <Skeleton className="mb-1 h-4 w-36" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
    <div className="bg-muted/50 mt-4 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  </div>
);

export {
  TipsSkeleton,
  StatusSkeleton,
  SummarySkeleton,
  DollarConversionSkeleton,
};
