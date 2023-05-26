import React, { ReactNode, useEffect, useRef, useState } from "react";

import { IoMdArrowDropdown } from "react-icons/io";

export interface DropdownItem<T extends React.Key> {
  key: T;
  selectedLabel: ReactNode;
  dropDownLabel: ReactNode;
}

interface SelectDropdownProps<T extends React.Key> {
  dropDownItems: Map<T, DropdownItem<T>>;
  onSelect: (key: T) => void;
  selectedItemKey: T;
  defaultItemKey: T;
}

type ClickOrTouchEvent = MouseEvent | TouchEvent;

function useMapToArray<T>(map: Map<T, any>): any[] {
  return React.useMemo(() => Array.from(map.values()), [map]);
}

export function SelectDropdown<T extends React.Key>({
  dropDownItems,
  onSelect,
  selectedItemKey,
  defaultItemKey,
}: SelectDropdownProps<T>): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemSelection = (dropDownItemKey: T) => {
    setIsDropdownOpen(false);
    onSelect(dropDownItemKey);
  };

  const handleClickOutside = (event: ClickOrTouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const selectedItem = dropDownItems.get(selectedItemKey);
  const defaultItem = dropDownItems.get(defaultItemKey);

  const dropDownItemsArray = useMapToArray(dropDownItems);
  return (
    <div ref={dropdownRef}>
      <button
        type="button"
        className="flex px-2 text-toolbar-text"
        onClick={toggleDropdown}
      >
        {selectedItem ? selectedItem.selectedLabel : defaultItem?.selectedLabel}
        <span className="my-auto">
          <IoMdArrowDropdown />
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 bg-toolbar-background shadow-lg">
          <div className="py-1">
            {dropDownItemsArray.map((dropDownItem: DropdownItem<T>) => (
              <div
                key={dropDownItem.key}
                className="cursor-pointer px-2 py-2 text-toolbar-text hover:bg-toolbar-hover"
                onClick={() => handleDropdownItemSelection(dropDownItem.key)}
              >
                {dropDownItem.dropDownLabel}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}