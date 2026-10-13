import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { USER_FACING_PERMISSION_RESOURCES } from '@/lib/permissions';
import type { PermissionAccessSummary } from '@/model/user.model';

interface AccessSummaryProps {
  summary: PermissionAccessSummary;
  showOverrides?: boolean;
}

export function AccessSummary({
  summary,
  showOverrides = false,
}: AccessSummaryProps) {
  const { t } = useTranslation('permissions');
  const visible = summary.readableResources.slice(0, 3);
  const remaining = summary.readableResources.length - visible.length;

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-muted-foreground text-xs">
        {t('accessSummary.visible', {
          count: summary.readableResources.length,
          total: USER_FACING_PERMISSION_RESOURCES.length,
        })}
        {' · '}
        {t('accessSummary.writable', {
          count: summary.writableResources.length,
        })}
        {showOverrides && summary.overrideCount > 0
          ? ` · ${t('accessSummary.overrides', {
              count: summary.overrideCount,
            })}`
          : ''}
      </p>
      <div
        className="flex flex-wrap gap-1"
        aria-label={t('accessSummary.areas')}
      >
        {visible.map((resource) => (
          <Badge
            key={resource}
            variant="outline"
            className="px-1.5 py-0 text-[10px]"
          >
            {t(`resources.${resource}`)}
          </Badge>
        ))}
        {remaining > 0 && (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            {t('accessSummary.more', { count: remaining })}
          </Badge>
        )}
        {summary.readableResources.length === 0 && (
          <span className="text-muted-foreground text-xs">
            {t('accessSummary.none')}
          </span>
        )}
      </div>
    </div>
  );
}
