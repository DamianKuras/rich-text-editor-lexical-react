import { ReactNode, useEffect, useRef, useState } from "react";
import { TooltipToggleButton } from "./TooltipToggleButton";

type ClickOrTouchEvent = MouseEvent | TouchEvent;

type DropdownProps = {
  buttonContent: ReactNode;
  children: ReactNode;
  dropdownTitle: string;
};

export function Dropdown({
  buttonContent,
  children,
  dropdownTitle,
}: DropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  useEffect(() => {
    const handleClickOutside = (event: ClickOrTouchEvent) => {
      if (
        dropdownRef.current &&
        isDropdownOpen &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);
  return (
    <div ref={dropdownRef}>
      <TooltipToggleButton
        tooltipMessage={dropdownTitle}
        onPress={toggleDropdown}
        selected={isDropdownOpen}
      >
        {buttonContent}
      </TooltipToggleButton>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 bg-toolbar-background shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}
