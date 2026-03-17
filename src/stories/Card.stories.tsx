import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrendingUp, Bell, Clock7 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Rendimento de Março</CardTitle>
        <CardDescription>Resumo do mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">R$ 5.300,00</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">Ver detalhes</Button>
      </CardFooter>
    </Card>
  ),
};

export const FeatureCard: Story = {
  render: () => (
    <Card className="w-72">
      <CardContent>
        <CardTitle className="mb-4 flex items-center gap-3">
          <TrendingUp className="text-primary size-8" />
          Análise financeira
        </CardTitle>
        <CardDescription>
          Visualize seus rendimentos e despesas com gráficos intuitivos mês a mês.
        </CardDescription>
      </CardContent>
    </Card>
  ),
};

export const TestimonialCard: Story = {
  render: () => (
    <Card className="w-72">
      <CardContent className="flex flex-col gap-4 pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          "Finalmente consigo ver pra onde meu dinheiro vai todo mês. Simples e muito rápido de usar."
        </p>
        <div>
          <p className="text-sm font-semibold">Ana Lima</p>
          <p className="text-muted-foreground text-xs">Freelancer</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const TransactionCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Jantar fora</CardTitle>
          <Badge variant="destructive">Despesa</Badge>
        </div>
        <CardDescription>16 de março de 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-red-500">- R$ 85,00</p>
      </CardContent>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
      {[
        { label: 'Rendimento', value: 'R$ 5.300', icon: TrendingUp, color: 'text-blue-500' },
        { label: 'Despesas', value: 'R$ 1.665', icon: Bell, color: 'text-red-500' },
        { label: 'Pendentes', value: 'R$ 250', icon: Clock7, color: 'text-amber-500' },
        { label: 'Disponível', value: 'R$ 3.385', icon: TrendingUp, color: 'text-emerald-500' },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4">
            <stat.icon className={`size-5 mb-2 ${stat.color}`} />
            <p className="text-muted-foreground text-xs">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
