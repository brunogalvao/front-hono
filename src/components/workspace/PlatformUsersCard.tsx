import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  FilterX,
  Search,
} from 'lucide-react';
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
import type { AppUserProfile, PlanTier, SignupOrigin } from '@/model/user.model';

interface PlatformUsersCardProps {
  currentUserId: string;
}

type PlanFilter = 'all' | 'free' | 'pro' | 'superuser';
type OriginFilter = 'all' | SignupOrigin;

interface PaginatedPlatformUsers {
  profiles: AppUserProfile[];
  total: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function PlatformUsersCard({ currentUserId }: PlatformUsersCardProps) {
  const { t } = useTranslation(['permissions', 'common']);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const normalizedSearch = search.trim();
  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    planFilter !== 'all' ||
    originFilter !== 'all';

  useEffect(() => {
    setPage(1);
  }, [normalizedSearch, planFilter, originFilter, pageSize]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'platform-users',
      {
        search: normalizedSearch.toLowerCase(),
        planFilter,
        originFilter,
        page,
        pageSize,
      },
    ],
    queryFn: async (): Promise<PaginatedPlatformUsers> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('profiles')
        .select(
          'id, email, full_name, avatar_url, plan_tier, is_platform_superuser, max_workspaces, signup_origin',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (normalizedSearch) {
        query = query.or(
          `email.ilike.%${normalizedSearch}%,full_name.ilike.%${normalizedSearch}%`
        );
      }

      if (planFilter === 'superuser') {
        query = query.eq('is_platform_superuser', true);
      } else if (planFilter === 'free' || planFilter === 'pro') {
        query = query
          .eq('is_platform_superuser', false)
          .eq('plan_tier', planFilter);
      }

      if (originFilter !== 'all') {
        query = query.eq('signup_origin', originFilter);
      }

      const { data: rows, error, count } = await query.range(from, to);
      if (error) throw error;
      return {
        profiles: (rows ?? []) as AppUserProfile[],
        total: count ?? 0,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const profiles = data?.profiles ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  useEffect(() => {
    if (total > 0 && page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount, total]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-60 flex-1">
            <Search
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('platformUsers.searchPlaceholder')}
              className="pl-9"
              aria-label={t('platformUsers.searchPlaceholder')}
            />
          </div>

          <Select
            value={planFilter}
            onValueChange={(value) => setPlanFilter(value as PlanFilter)}
          >
            <SelectTrigger
              className="w-full text-xs sm:w-44"
              aria-label={t('platformUsers.filters.planLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                {t('platformUsers.filters.planAll')}
              </SelectItem>
              <SelectItem value="free" className="text-xs">
                {t('allUsers.plan.free')}
              </SelectItem>
              <SelectItem value="pro" className="text-xs">
                {t('allUsers.plan.pro')}
              </SelectItem>
              <SelectItem value="superuser" className="text-xs">
                {t('allUsers.platformSuperuserBadge')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={originFilter}
            onValueChange={(value) => setOriginFilter(value as OriginFilter)}
          >
            <SelectTrigger
              className="w-full text-xs sm:w-44"
              aria-label={t('platformUsers.filters.originLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                {t('platformUsers.filters.originAll')}
              </SelectItem>
              <SelectItem value="self_signup" className="text-xs">
                {t('platformUsers.filters.originSelfSignup')}
              </SelectItem>
              <SelectItem value="workspace_invite" className="text-xs">
                {t('platformUsers.filters.originInvite')}
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearch('');
                setPlanFilter('all');
                setOriginFilter('all');
              }}
            >
              <FilterX className="mr-1.5 size-3.5" aria-hidden="true" />
              {t('platformUsers.filters.clear')}
            </Button>
          )}
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
                      {profile.signup_origin && (
                        <Badge variant="outline" className="text-[10px]">
                          {profile.signup_origin === 'workspace_invite'
                            ? t('platformUsers.filters.originInvite')
                            : t('platformUsers.filters.originSelfSignup')}
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

        {total > 0 && (
          <nav
            aria-label={t('platformUsers.pagination.label')}
            className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-muted-foreground text-xs">
                {t('platformUsers.pagination.total', { count: total })}
              </p>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => setPageSize(Number(val))}
              >
                <SelectTrigger
                  className="h-8 w-28 text-xs"
                  aria-label={t('platformUsers.pagination.perPageLabel')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-xs">
                      {t('platformUsers.pagination.perPage', { count: size })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                aria-label={t('allUsers.pagination.previous')}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground min-w-24 text-center text-xs">
                {t('allUsers.pagination.page', {
                  page,
                  total: pageCount,
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                aria-label={t('allUsers.pagination.next')}
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        )}
      </CardContent>
    </Card>
  );
}
