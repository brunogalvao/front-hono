export interface GroupAccess {
  access_expenses: boolean;
  access_incomes: boolean;
  access_installments: boolean;
  access_advisor: boolean;
}

export const defaultGroupAccess: GroupAccess = {
  access_expenses: true,
  access_incomes: true,
  access_installments: true,
  access_advisor: true,
};
