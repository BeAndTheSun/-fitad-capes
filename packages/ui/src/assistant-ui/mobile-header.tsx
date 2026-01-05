'use client';

type MobileHeaderProps = {
  chatName?: string;
  onToggleSidebar: () => void;
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  chatName = 'Assistant Chat',
  onToggleSidebar,
}) => {
  return (
    <div className="flex items-center justify-between border-b bg-muted/5 p-4 md:hidden">
      <h2 className="font-semibold">{chatName}</h2>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md border p-2 hover:bg-muted"
        aria-label="Toggle menu"
      >
        ☰
      </button>
    </div>
  );
};
