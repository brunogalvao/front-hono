import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, UserPlus, WalletCards } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/context/WorkspaceContext';
import { inviteWorkspaceMember } from '@/hooks/useWorkspaceMembers';
import { queryKeys } from '@/lib/query-keys';
import { createWorkspace, WorkspaceCreationError } from '@/service/workspaces';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildSchema = (messages: {
  nameRequired: string;
  nameTooLong: string;
  emailInvalid: string;
}) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(3, messages.nameRequired)
        .max(60, messages.nameTooLong),
      inviteNow: z.boolean(),
      email: z.string(),
      role: z.enum(['administrador', 'operador', 'visualizador']),
    })
    .superRefine((value, context) => {
      if (!value.inviteNow) return;
      const result = z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .safeParse(value.email);
      if (!result.success) {
        context.addIssue({
          code: 'custom',
          path: ['email'],
          message: messages.emailInvalid,
        });
      }
    });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const { t } = useTranslation(['nav', 'invite']);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activateWorkspace } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const schema = useMemo(
    () =>
      buildSchema({
        nameRequired: t('nav:createWorkspace.validation.nameRequired'),
        nameTooLong: t('nav:createWorkspace.validation.nameTooLong'),
        emailInvalid: t('invite:validation.emailInvalid'),
      }),
    [t]
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      inviteNow: false,
      email: '',
      role: 'visualizador',
    },
  });
  const inviteNow = form.watch('inviteNow');

  const setOpen = (nextOpen: boolean) => {
    if (submitting) return;
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const workspace = await createWorkspace(values.name);
      activateWorkspace(workspace);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.list,
      });

      if (values.inviteNow) {
        try {
          const invite = await inviteWorkspaceMember(
            workspace.id,
            values.email,
            values.role
          );
          if (invite.status === 'sent') {
            toast.success(t('nav:createWorkspace.successWithInvite'));
          } else {
            toast.warning(
              t(`invite:mutation.${invite.status}`, {
                defaultValue: t('nav:createWorkspace.inviteWarning'),
              })
            );
          }
        } catch {
          toast.warning(t('nav:createWorkspace.inviteWarning'));
        }
        await navigate({ to: '/admin/settings/members' });
      } else {
        toast.success(t('nav:createWorkspace.success'));
        await navigate({ to: '/admin/dashboard' });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const code =
        error instanceof WorkspaceCreationError
          ? error.code
          : 'workspace_creation_failed';
      toast.error(
        t(`nav:createWorkspace.errors.${code}`, {
          defaultValue: t(
            'nav:createWorkspace.errors.workspace_creation_failed'
          ),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
            <WalletCards className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>{t('nav:createWorkspace.title')}</DialogTitle>
          <DialogDescription>
            {t('nav:createWorkspace.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-workspace-form"
            className="space-y-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nav:createWorkspace.name')}</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      maxLength={60}
                      placeholder={t('nav:createWorkspace.namePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inviteNow"
              render={({ field }) => (
                <FormItem className="bg-muted/40 flex items-start gap-3 rounded-lg border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) =>
                        field.onChange(value === true)
                      }
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="flex items-center gap-2">
                      <UserPlus className="size-4" aria-hidden="true" />
                      {t('nav:createWorkspace.inviteNow')}
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      {t('nav:createWorkspace.inviteDescription')}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {inviteNow && (
              <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invite:form.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder={t('invite:form.emailPlaceholder')}
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
                    <FormItem>
                      <FormLabel>{t('invite:form.role')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="administrador">
                            {t('invite:roles.administrador')}
                          </SelectItem>
                          <SelectItem value="operador">
                            {t('invite:roles.operador')}
                          </SelectItem>
                          <SelectItem value="visualizador">
                            {t('invite:roles.visualizador')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t('nav:createWorkspace.cancel')}
          </Button>
          <Button
            type="submit"
            form="create-workspace-form"
            disabled={submitting}
          >
            {submitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {submitting
              ? t('nav:createWorkspace.creating')
              : t('nav:createWorkspace.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
