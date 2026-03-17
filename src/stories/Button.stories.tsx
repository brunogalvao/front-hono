import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Começar agora' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Cancelar' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Excluir' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secundário' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Ver mais' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Entrar na conta' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Entrar' },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Adicionar despesa
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: { size: 'icon', children: <Trash2 /> },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Indisponível' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const LoginButton: Story = {
  render: () => (
    <Button size="sm" className="gap-2 rounded-full">
      Entrar
      <LogIn className="size-4" />
    </Button>
  ),
};
