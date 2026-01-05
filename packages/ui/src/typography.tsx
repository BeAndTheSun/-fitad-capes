import { cn } from '@meltstudio/theme';
import React from 'react';

export const H1 = React.forwardRef<
  React.ElementRef<'h1'>,
  React.ComponentPropsWithoutRef<'h1'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <h1
      ref={ref}
      className={cn(
        'scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className
      )}
      {...extra}
    >
      {children}
    </h1>
  );
});

export const H2 = React.forwardRef<
  React.ElementRef<'h2'>,
  React.ComponentPropsWithoutRef<'h2'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <h2
      ref={ref}
      className={cn(
        'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
        className
      )}
      {...extra}
    >
      {children}
    </h2>
  );
});

export const H3 = React.forwardRef<
  React.ElementRef<'h3'>,
  React.ComponentPropsWithoutRef<'h3'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <h3
      ref={ref}
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className
      )}
      {...extra}
    >
      {children}
    </h3>
  );
});

export const H4 = React.forwardRef<
  React.ElementRef<'h4'>,
  React.ComponentPropsWithoutRef<'h4'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <h4
      ref={ref}
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}
      {...extra}
    >
      {children}
    </h4>
  );
});

export const Paragraph = React.forwardRef<
  React.ElementRef<'p'>,
  React.ComponentPropsWithoutRef<'p'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <p
      ref={ref}
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...extra}
    >
      {children}
    </p>
  );
});

export const Blockquote = React.forwardRef<
  React.ElementRef<'blockquote'>,
  React.ComponentPropsWithoutRef<'blockquote'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <blockquote
      ref={ref}
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...extra}
    >
      {children}
    </blockquote>
  );
});

export const InlineCode = React.forwardRef<
  React.ElementRef<'code'>,
  React.ComponentPropsWithoutRef<'code'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <code
      ref={ref}
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}
      {...extra}
    >
      {children}
    </code>
  );
});

export const Lead = React.forwardRef<
  React.ElementRef<'p'>,
  React.ComponentPropsWithoutRef<'p'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <p
      ref={ref}
      className={cn('text-xl text-muted-foreground', className)}
      {...extra}
    >
      {children}
    </p>
  );
});

export const Large = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <div
      ref={ref}
      className={cn('text-lg font-semibold', className)}
      {...extra}
    >
      {children}
    </div>
  );
});

export const Small = React.forwardRef<
  React.ElementRef<'small'>,
  React.ComponentPropsWithoutRef<'small'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <small
      ref={ref}
      className={cn('text-sm font-medium leading-none', className)}
      {...extra}
    >
      {children}
    </small>
  );
});

export const Muted = React.forwardRef<
  React.ElementRef<'p'>,
  React.ComponentPropsWithoutRef<'p'>
>((props, ref) => {
  const { children, className, ...extra } = props;

  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...extra}
    >
      {children}
    </p>
  );
});

export const Typography = {
  H1,
  H2,
  H3,
  H4,
  Paragraph,
  Blockquote,
  InlineCode,
  Lead,
  Large,
  Small,
  Subtle: Muted,
};
