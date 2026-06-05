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

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['administrador', 'operador', 'visualizador'] as const),
});

type FormValues = z.infer<typeof schema>;

interface InviteFormProps {
  onInvite: (email: string, role: WorkspaceRole) => Promise<unknown>;
}

export function InviteForm({ onInvite }: InviteFormProps) {
  const { t } = useTranslation(['permissions', 'common']);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'visualizador' },
  });

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await onInvite(values.email, values.role);
      toast.success(t('invite.toast.sent', { email: values.email }));
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('invite.toast.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
  );
}
