import type { Meta, StoryObj } from '@storybook/react-vite';
import { DemoPreview } from '@/components/DemoPreview';

const meta: Meta<typeof DemoPreview> = {
  title: 'Landing/DemoPreview',
  component: DemoPreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Simulação animada da interface do app. Percorre o ciclo: idle → hover → modal → digitação → submit → atualização do gráfico.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DemoPreview>;

export const Default: Story = {};

export const InContainer: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto">
      <DemoPreview />
    </div>
  ),
};
