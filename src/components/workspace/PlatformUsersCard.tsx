import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import type { AppUserProfile, PlanTier } from '@/model/user.model';

interface PlatformUsersCardProps {
  currentUserId: string;
}

export function PlatformUsersCard({ currentUserId }: PlatformUsersCardProps) {
  const { t } = useTranslation(['permissions', 'common']);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['platform-users', search.trim().toLowerCase()],
    queryFn: async (): Promise<AppUserProfile[]> => {
      let query = supabase
        .from('profiles')
        .select(
          'id, email, full_name, avatar_url, plan_tier, is_platform_superuser, max_workspaces, signup_origin'
        )
        .order('created_at', { ascending: false })
        .limit(50);

      const term = search.trim();
      if (term) {
        query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AppUserProfile[];
    },
    staleTime: 15_000,
  });

  const updateAccess = useMutation({
    mutationFn: async ({
      targetUserId,
      planTier,
      isPlatformSuperuser,
    }: {
      targetUserId: string;
      planTier?: PlanTier;
      isPlatformSuperuser?: boolean;
    }) => {
      const { error } = await supabase.rpc('admin_update_user_access', {
        p_target_user_id: targetUserId,
        p_plan_tier: planTier ?? null,
        p_is_platform_superuser:
          isPlatformSuperuser === undefined ? null : isPlatformSuperuser,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.appUsers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });

  const handlePlanChange = async (targetUserId: string, planTier: PlanTier) => {
    try {
      await updateAccess.mutateAsync({ targetUserId, planTier });
      toast.success(t('allUsers.toast.planUpdated'));
    } catch {
      toast.error(t('allUsers.toast.planUpdateError'));
    }
  };

  const handleToggleSuperuser = async (
    targetUserId: string,
    nextValue: boolean
  ) => {
    try {
      await updateAccess.mutateAsync({
        targetUserId,
        isPlatformSuperuser: nextValue,
      });
      toast.success(
        t(
          nextValue
            ? 'allUsers.toast.superuserGranted'
            : 'allUsers.toast.superuserRevoked'
        )
      );
    } catch {
      toast.error(t('allUsers.toast.superuserUpdateError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="text-primary size-5" aria-hidden="true" />
          {t('platformUsers.title')}
        </CardTitle>
        <CardDescription>{t('platformUsers.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('platformUsers.searchPlaceholder')}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('platformUsers.empty')}
          </p>
        ) : (
          <div className="space-y-2">
            {profiles.map((profile) => {
              const name = profile.full_name ?? profile.email;
              const isSelf = profile.id === currentUserId;
              const isRootSuperuser =
                profile.email.toLowerCase() === 'bruno_galvao@outlook.com';
              const isSuper = Boolean(profile.is_platform_superuser);
              const currentPlan: PlanTier = profile.plan_tier ?? 'free';

              return (
                <div
                  key={profile.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border p-3 sm:flex-nowrap"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {name}
                        {isSelf && (
                          <span className="text-muted-foreground ml-1 font-normal">
                            {t('allUsers.currentSession')}
                          </span>
                        )}
                      </p>
                      {isSuper ? (
                        <Badge className="gap-1 text-[10px]">
                          <Crown className="size-3" aria-hidden="true" />
                          {t('allUsers.platformSuperuserBadge')}
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            currentPlan === 'pro' ? 'default' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {t(`allUsers.plan.${currentPlan}`)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {profile.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSuper && (
                      <Select
                        value={currentPlan}
                        disabled={updateAccess.isPending}
                        onValueChange={(val) =>
                          void handlePlanChange(profile.id, val as PlanTier)
                        }
                      >
                        <SelectTrigger
                          className="min-h-11 w-32 text-xs md:min-h-8"
                          aria-label={t('allUsers.planSelectLabel')}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free" className="text-xs">
                            {t('allUsers.plan.free')}
                          </SelectItem>
                          <SelectItem value="pro" className="text-xs">
                            {t('allUsers.plan.pro')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {!isSelf && !isRootSuperuser && (
                      <Button
                        type="button"
                        variant={isSuper ? 'secondary' : 'outline'}
                        size="sm"
                        className="text-xs"
                        disabled={updateAccess.isPending}
                        onClick={() =>
                          void handleToggleSuperuser(profile.id, !isSuper)
                        }
                      >
                        <Crown
                          className={`mr-1.5 size-3.5 ${
                            isSuper
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          }`}
                          aria-hidden="true"
                        />
                        {t(
                          isSuper
                            ? 'allUsers.revokeSuperuser'
                            : 'allUsers.grantSuperuser'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
