import type { IconName } from '@/model/icon.card.model';

export const CARDS: { title: string; description: string; icons: IconName }[] =
  [
    {
      title: 'Registre na hora',
      description: 'Adicione receitas e despesas rapidamente, sem complicação.',
      icons: 'Clock7',
    },
    {
      title: 'Nunca perca um prazo',
      description:
        'Organize tarefas financeiras por mês e mantenha tudo em dia.',
      icons: 'Bell',
    },
    {
      title: 'Histórico completo',
      description:
        'Visualize entradas, saídas e saldo mês a mês com clareza.',
      icons: 'Cog',
    },
    {
      title: 'Insights inteligentes',
      description:
        'Receba recomendações automáticas baseadas no seu perfil financeiro.',
      icons: 'Heart',
    },
  ];
