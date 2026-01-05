export const FullLayout: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {children}
    </div>
  );
};
