import { ReactNode } from "react";
import {
  OverlayArrow,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";

type Props = {
  tooltipMessage: string;
  onPress?: () => void;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  selected?: boolean;
};

export function TooltipToggleButton({
  tooltipMessage,
  className,
  onPress,
  children,
  disabled,
  selected,
}: Props): JSX.Element {
  return (
    <TooltipTrigger>
      <ToggleButton
        isDisabled={disabled}
        isSelected={selected}
        className={`${className ? className + " " : ""}px-2 pb-2 pt-1 ${
          disabled ? "[&>svg]:text-gray-300" : "hover:bg-gray-700"
        } ${selected ? "bg-gray-700" : ""}`}
        onPress={onPress}
      >
        {children}
      </ToggleButton>
      <Tooltip
        className="react-aria-Tooltip bg-gray-900 text-white-600"
        placement="bottom"
      >
        <OverlayArrow>
          <svg
            width={8}
            height={8}
            fill="#161616"
          >
            <path d="M0 0,L4 4,L8 0" />
          </svg>
        </OverlayArrow>
        <div className="p-1 text-sm">{tooltipMessage}</div>
      </Tooltip>
    </TooltipTrigger>
  );
}
