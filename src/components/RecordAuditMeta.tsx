import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuditProfile {
  full_name: string | null;
}

interface RecordAuditMetaProps {
  creator?: AuditProfile | null;
  editor?: AuditProfile | null;
  createdAt: string;
  updatedAt: string;
  className?: string;
}

export function RecordAuditMeta({
  creator,
  editor,
  createdAt,
  updatedAt,
  className,
}: RecordAuditMetaProps) {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'pt-BR';
  const createdDate = new Date(createdAt);
  const updatedDate = new Date(updatedAt);
  const wasEdited =
    Number.isFinite(updatedDate.getTime()) &&
    Number.isFinite(createdDate.getTime()) &&
    updatedDate.getTime() - createdDate.getTime() > 1_000;
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const creatorName = creator?.full_name?.trim() || t('audit.unknownUser');
  const editorName = editor?.full_name?.trim();

  return (
    <div
      className={`text-muted-foreground flex items-start gap-1.5 text-xs ${className ?? ''}`}
    >
      <History className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      <span>
        {t('audit.createdBy', {
          name: creatorName,
          date: Number.isFinite(createdDate.getTime())
            ? formatter.format(createdDate)
            : t('audit.unknownDate'),
        })}
        {wasEdited && (
          <>
            {' · '}
            {editorName
              ? t('audit.editedBy', {
                  name: editorName,
                  date: formatter.format(updatedDate),
                })
              : t('audit.automaticallyUpdated', {
                  date: formatter.format(updatedDate),
                })}
          </>
        )}
      </span>
    </div>
  );
}
