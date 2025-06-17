'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

/**
 * A generic, reusable dropdown menu component.
 * - Handles all the logic for toggling visibility.
 * - Detects clicks outside the menu to close it automatically.
 * - This component abstracts away the repetitive state and effect logic.
 */
export default function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = () => {
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div 
          // This ensures when we click an item in the menu, the menu closes.
          onClick={() => setIsOpen(false)}
          className="profile-menu" // Using existing styles for consistency
        >
          {children}
        </div>
      )}
    </div>
  );
}
