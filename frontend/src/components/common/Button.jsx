import clsx from 'clsx';

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  as: Comp = 'button',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    onDark: 'btn-on-dark',
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: '',
    lg: 'px-7 py-3.5 text-base',
  };
  return (
    <Comp className={clsx(variants[variant] ?? 'btn-primary', sizes[size], className)} {...props}>
      {children}
    </Comp>
  );
}
