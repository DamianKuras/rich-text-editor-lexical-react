import React, { ReactNode, useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";

export interface SelectItem<T extends React.Key> {
  key: T;
  selectedLabel: ReactNode;
  label: ReactNode;
}

interface SelectProps<T extends React.Key> {
  selectItems: Map<T, SelectItem<T>>;
  onSelect: (key: T) => void;
  selectedItemKey: T;
  defaultItemKey: T;
}

type ClickOrTouchEvent = MouseEvent | TouchEvent;

function useMapToArray<T, U>(map: Map<T, U>): U[] {
  return React.useMemo(() => Array.from(map.values()), [map]);
}

export function Select<T extends React.Key>({
  selectItems,
  onSelect,
  selectedItemKey,
  defaultItemKey,
}: SelectProps<T>): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemSelection = (dropDownItemKey: T) => {
    setIsDropdownOpen(false);
    onSelect(dropDownItemKey);
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

  const selectedItem = selectItems.get(selectedItemKey);
  const defaultItem = selectItems.get(defaultItemKey);

  const dropDownItemsArray = useMapToArray(selectItems);
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
            {dropDownItemsArray.map((dropDownItem: SelectItem<T>) => (
              <div
                key={dropDownItem.key}
                className="cursor-pointer px-2 py-1 text-toolbar-text hover:bg-toolbar-hover"
                onClick={() => handleDropdownItemSelection(dropDownItem.key)}
              >
                {dropDownItem.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
