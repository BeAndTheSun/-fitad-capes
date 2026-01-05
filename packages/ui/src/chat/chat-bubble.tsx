import type { ButtonProps } from '@meltstudio/theme';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
} from '@meltstudio/theme';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { MessageLoading } from './message-loading';

// ChatBubble
const chatBubbleVariant = cva(
  'group relative flex max-w-full items-end gap-2 sm:max-w-[60%]',
  {
    variants: {
      variant: {
        received: 'self-start',
        sent: 'flex-row-reverse self-end',
      },
      layout: {
        default: '',
        ai: 'w-full max-w-full items-center',
      },
    },
    defaultVariants: {
      variant: 'received',
      layout: 'default',
    },
  }
);

type ChatBubbleProps = object &
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof chatBubbleVariant>;

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, layout, children, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleVariant({ variant, layout, className }),
        'relative group'
      )}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== 'string'
          ? React.cloneElement(child as React.ReactElement, {
              variant,
              layout,
            })
          : child
      )}
    </div>
  )
);
ChatBubble.displayName = 'ChatBubble';

// ChatBubbleAvatar
type ChatBubbleAvatarProps = {
  src?: string;
  fallback?: string;
  className?: string;
};

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
}) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

// ChatBubbleMessage
const chatBubbleMessageVariants = cva('p-4', {
  variants: {
    variant: {
      received:
        'rounded-r-lg rounded-tl-lg bg-secondary text-secondary-foreground',
      sent: 'rounded-l-lg rounded-tr-lg bg-primary text-primary-foreground',
    },
    layout: {
      default: '',
      ai: 'w-full rounded-none border-t bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'received',
    layout: 'default',
  },
});

type ChatBubbleMessageProps = {
  isLoading?: boolean;
} & React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof chatBubbleMessageVariants>;

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(
  (
    { className, variant, layout, isLoading = false, children, ...props },
    ref
  ) => (
    <div
      className={cn(
        chatBubbleMessageVariants({ variant, layout, className }),
        'break-words max-w-full whitespace-pre-wrap'
      )}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
);
ChatBubbleMessage.displayName = 'ChatBubbleMessage';

// ChatBubbleTimestamp
type ChatBubbleTimestampProps = {
  timestamp: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn('text-xs mt-2 text-right', className)} {...props}>
    {timestamp}
  </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
  icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={className}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

type ChatBubbleActionWrapperProps = {
  variant?: 'sent' | 'received';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  ChatBubbleActionWrapperProps
>(({ variant, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200',
      variant === 'sent'
        ? '-left-1 -translate-x-full flex-row-reverse'
        : '-right-1 translate-x-full',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ChatBubbleActionWrapper.displayName = 'ChatBubbleActionWrapper';

export {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  chatBubbleMessageVariants,
  ChatBubbleTimestamp,
  chatBubbleVariant,
};
