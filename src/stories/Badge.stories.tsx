import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: '100% Gratuito' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Pendente' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Vencido' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Rascunho' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Gratuito</Badge>
      <Badge variant="secondary">Pendente</Badge>
      <Badge variant="destructive">Vencido</Badge>
      <Badge variant="outline">Rascunho</Badge>
    </div>
  ),
};

export const HeroBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {['100% Gratuito', 'Insights com IA', 'Sem cartão de crédito'].map((label) => (
        <Badge key={label} variant="outline">
          {label}
        </Badge>
      ))}
    </div>
  ),
};
