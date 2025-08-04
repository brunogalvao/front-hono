import { formatToBRL } from '@/utils/format';
import { Skeleton } from './ui/skeleton';

interface DashboardCardProps {
  title: string;
  value: number;
  isLoading?: boolean;
  error?: string | null;
  color?: 'primary' | 'green' | 'orange' | 'purple' | 'blue';
  formatValue?: (value: number) => string;
}

const DashboardCard = ({
  title,
  value,
  isLoading = false,
  error = null,
  color = 'primary',
  formatValue = formatToBRL,
}: DashboardCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'purple':
        return 'bg-purple-500';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex min-h-24 flex-col items-stretch justify-between gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </>
        ) : (
          <>
            <span className="font-medium">{title}</span>
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span
                className={`rounded-full ${getColorClasses()} px-3 text-center text-lg font-bold text-white`}
              >
                {formatValue(value)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
