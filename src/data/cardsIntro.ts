import type { IconName } from '@/model/icon.card.model';

export const CARDS: { title: string; description: string; icons: IconName }[] =
  [
    {
      title: 'Registre na hora',
      description: 'Adicione receitas e despesas rapidamente, sem complicação.',
      icons: 'Clock7',
    },
    {
      title: 'Aqui para te lembras',
      description:
        'Mantenha suas tarefas financeiras organizadas e nunca perca um compromisso.',
      icons: 'Bell',
    },
    {
      title: 'Controle de tudo',
      description:
        'Gerencie suas finanças com ferramentas intuitivas e completas.',
      icons: 'Cog',
    },
    {
      title: 'Você vai adorar',
      description:
        'Experimente uma plataforma feita para facilitar sua vida financeira.',
      icons: 'Heart',
    },
  ];
