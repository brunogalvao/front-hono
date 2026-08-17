import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { WorkspaceRole } from '@/context/WorkspaceContext';
import type { InviteMutationResult } from '@/model/invite.model';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  role: z.enum(['administrador', 'operador', 'visualizador'] as const),
});

type FormValues = z.infer<typeof schema>;

interface InviteFormProps {
  onInvite: (
    email: string,
    role: WorkspaceRole
  ) => Promise<InviteMutationResult | unknown>;
}

export function InviteForm({ onInvite }: InviteFormProps) {
  const { t } = useTranslation('invite');
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'visualizador' },
  });

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const result = (await onInvite(values.email, values.role)) as
        | InviteMutationResult
        | undefined;
      switch (result?.status) {
        case 'sent':
          toast.success(t('mutation.sent'));
          form.reset();
          break;
        case 'delivery_failed':
          toast.error(t('mutation.delivery_failed'));
          break;
        case 'already_member':
        case 'existing_pending_invite':
        case 'rate_limited':
          toast.warning(t(`mutation.${result.status}`));
          break;
        default:
          toast.error(t('states.failedDescription'));
      }
    } catch {
      toast.error(t('states.failedDescription'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('form.email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('form.emailPlaceholder')}
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-44">
                <FormLabel>{t('form.role')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="administrador">
                      {t('roles.administrador')}
                    </SelectItem>
                    <SelectItem value="operador">
                      {t('roles.operador')}
                    </SelectItem>
                    <SelectItem value="visualizador">
                      {t('roles.visualizador')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={submitting} className="self-end">
            {submitting ? t('form.submitting') : t('form.submit')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
