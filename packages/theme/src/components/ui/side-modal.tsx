import { Cross1Icon } from '@radix-ui/react-icons';
import React from 'react';

import { Button } from './button';

type SideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  overlay?: boolean;
};

export const SideModal: React.FC<SideModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  overlay,
}) => {
  return (
    <>
      {isOpen && overlay && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/80"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="flex h-full flex-col space-y-6 overflow-y-auto p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </div>
            <Button type="button" onClick={onClose} variant="ghost">
              <Cross1Icon />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
