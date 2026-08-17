-- Migration 012: RLS Policies

-- Workspaces
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id));

CREATE POLICY "Admins can update workspace"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_admin(id));

-- Workspace Members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Admins can insert members"
  ON public.workspace_members FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can update member roles"
  ON public.workspace_members FOR UPDATE
  USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can remove members"
  ON public.workspace_members FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- Workspace Invites
CREATE POLICY "Admins can view invites"
  ON public.workspace_invites FOR SELECT
  USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can create invites"
  ON public.workspace_invites FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can cancel invites"
  ON public.workspace_invites FOR UPDATE
  USING (public.is_workspace_admin(workspace_id));

-- Categories
CREATE POLICY "Members can view categories"
  ON public.categories FOR SELECT
  USING (workspace_id IS NULL OR public.is_workspace_member(workspace_id));

CREATE POLICY "Admins can manage custom categories"
  ON public.categories FOR INSERT
  WITH CHECK (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can update custom categories"
  ON public.categories FOR UPDATE
  USING (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id));

CREATE POLICY "Admins can delete custom categories"
  ON public.categories FOR DELETE
  USING (workspace_id IS NOT NULL AND public.is_workspace_admin(workspace_id));

-- Transactions
CREATE POLICY "Members can view transactions"
  ON public.transactions FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Writers can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (public.can_write_workspace(workspace_id));

CREATE POLICY "Admin or owner can update transaction"
  ON public.transactions FOR UPDATE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

CREATE POLICY "Admin or owner can delete transaction"
  ON public.transactions FOR DELETE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

-- Recurring Expenses
CREATE POLICY "Members can view recurring expenses"
  ON public.recurring_expenses FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Writers can create recurring expenses"
  ON public.recurring_expenses FOR INSERT
  WITH CHECK (public.can_write_workspace(workspace_id));

CREATE POLICY "Admin or owner can update recurring expense"
  ON public.recurring_expenses FOR UPDATE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

CREATE POLICY "Admin or owner can delete recurring expense"
  ON public.recurring_expenses FOR DELETE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

-- Installments
CREATE POLICY "Members can view installments"
  ON public.installments FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Writers can create installments"
  ON public.installments FOR INSERT
  WITH CHECK (public.can_write_workspace(workspace_id));

CREATE POLICY "Admin or owner can update installment"
  ON public.installments FOR UPDATE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

CREATE POLICY "Admin or owner can delete installment"
  ON public.installments FOR DELETE
  USING (
    public.is_workspace_admin(workspace_id)
    OR (public.can_write_workspace(workspace_id) AND created_by = auth.uid())
  );

-- Insights
CREATE POLICY "Members can view insights"
  ON public.insights FOR SELECT
  USING (public.is_workspace_member(workspace_id));
