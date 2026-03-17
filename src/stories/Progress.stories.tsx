import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@/components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60, className: 'w-72' },
};

export const Empty: Story = {
  args: { value: 0, className: 'w-72' },
};

export const Full: Story = {
  args: { value: 100, className: 'w-72' },
};

export const BudgetBars: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      {[
        { label: 'Alimentação', value: 72, color: '' },
        { label: 'Transporte', value: 45, color: '' },
        { label: 'Lazer', value: 88, color: 'bg-amber-500/20 [&>*]:bg-amber-500' },
        { label: 'Saúde', value: 30, color: 'bg-emerald-500/20 [&>*]:bg-emerald-500' },
      ].map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <Progress value={item.value} className={item.color} />
        </div>
      ))}
    </div>
  ),
};
