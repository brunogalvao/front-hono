import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { WorkspaceRole } from '@/context/WorkspaceContext';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['administrador', 'operador', 'visualizador'] as const),
});

type FormValues = z.infer<typeof schema>;

interface InviteResult {
  email_sent?: boolean;
  invite_url?: string;
  email_warning?: string;
}

interface InviteFormProps {
  onInvite: (email: string, role: WorkspaceRole) => Promise<unknown>;
}

export function InviteForm({ onInvite }: InviteFormProps) {
  const { t } = useTranslation(['permissions', 'common']);
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'visualizador' },
  });

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setInviteLink(null);
    try {
      const result = (await onInvite(values.email, values.role)) as InviteResult | undefined;

      if (result?.email_sent === false && result.invite_url) {
        setInviteLink(result.invite_url);
        toast.warning(result.email_warning ?? 'E-mail não enviado. Compartilhe o link manualmente.');
      } else {
        toast.success(t('invite.toast.sent', { email: values.email }));
      }
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('invite.toast.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t('invite.emailLabel')}</FormLabel>
              <FormControl><Input type="email" placeholder={t('invite.emailPlaceholder')} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem className="w-44">
              <FormLabel>{t('invite.roleLabel')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="administrador">{t('roles.administrador')}</SelectItem>
                  <SelectItem value="operador">{t('roles.operador')}</SelectItem>
                  <SelectItem value="visualizador">{t('roles.visualizador')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" disabled={submitting} className="self-end">
            {submitting ? t('invite.submitting') : t('invite.submit')}
          </Button>
        </form>
      </Form>

      {inviteLink && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">
            E-mail não enviado — compartilhe este link com o convidado:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-800 px-2 py-1 text-xs text-amber-900 dark:text-amber-100">
              {inviteLink}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 h-7 border-amber-300 dark:border-amber-700"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              <span className="ml-1 text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
