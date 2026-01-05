import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/theme/index';

type SimpleTooltipProps = {
  content: string;
};

export const SimpleTooltip: React.FC<
  React.PropsWithChildren<SimpleTooltipProps>
> = (props) => {
  const { content, children } = props;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="origin-[var(--radix-tooltip-content-transform-origin)]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
