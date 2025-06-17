'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

/**
 * A generic, reusable dropdown menu component.
 * - Handles all the logic for toggling visibility based on a trigger click.
 * - Detects clicks outside the menu to close it automatically, preventing it
 *   from being stuck open.
 * - This component abstracts away the repetitive state and effect logic,
 *   adhering to the DRY (Don't Repeat Yourself) principle.
 */
export default function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggles the dropdown's visibility when the trigger is clicked.
  const handleTriggerClick = () => {
    setIsOpen(prev => !prev);
  };

  // Effect to handle clicks outside of the component.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener when the component mounts.
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when the component unmounts.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div 
          // This ensures that when a user clicks an item inside the menu (like a Link),
          // the menu closes, providing immediate visual feedback.
          onClick={() => setIsOpen(false)}
          className="profile-menu" // Using existing styles for visual consistency
        >
          {children}
        </div>
      )}
    </div>
  );
}
