import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Digite algo...' },
};

export const Email: Story = {
  args: { type: 'email', placeholder: 'seu@email.com' },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Sua senha' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Campo desabilitado', value: 'Valor fixo' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-72">
      <Label htmlFor="email">E-mail</Label>
      <Input id="email" type="email" placeholder="seu@email.com" />
    </div>
  ),
};

export const FormLogin: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">
          <Mail className="size-3.5 inline mr-1" />
          E-mail
        </Label>
        <Input id="login-email" type="email" placeholder="seu@email.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">
          <Lock className="size-3.5 inline mr-1" />
          Senha
        </Label>
        <Input id="login-password" type="password" placeholder="••••••••" />
      </div>
    </div>
  ),
};

export const SearchInput: Story = {
  render: () => (
    <div className="relative w-72">
      <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input className="pl-9" placeholder="Buscar transações..." />
    </div>
  ),
};

export const TransactionForm: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-72 rounded-xl border p-4">
      <p className="font-semibold text-sm">Nova despesa</p>
      <div className="flex flex-col gap-1.5">
        <Label>Descrição</Label>
        <Input placeholder="Ex: Jantar fora" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Valor (R$)</Label>
        <Input type="number" placeholder="0,00" />
      </div>
    </div>
  ),
};
