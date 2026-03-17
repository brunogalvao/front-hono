import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>BG</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
      <AvatarFallback>SC</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-6">
        <AvatarFallback className="text-[10px]">BG</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback>BG</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>BG</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback className="text-xl">BG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const UserGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {['BG', 'AL', 'CM', 'JC'].map((initials) => (
        <Avatar key={initials} className="ring-background ring-2">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar className="size-10">
        <AvatarFallback>BG</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold">Bruno Galvão</p>
        <p className="text-muted-foreground text-xs">bruno@email.com</p>
      </div>
    </div>
  ),
};
