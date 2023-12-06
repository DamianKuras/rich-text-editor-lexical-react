import { ReactNode } from "react";
import {
  Button,
  OverlayArrow,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";

type Props = {
  tooltipMessage: string;
  onPress?: () => void;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
};

export function TooltipButton({
  tooltipMessage,
  onPress,
  children,
  disabled,
}: Readonly<Props>): JSX.Element {
  return (
    <TooltipTrigger>
      <Button
        isDisabled={disabled}
        className={`$flex items-center px-2 py-2 outline-none data-[pressed]:bg-gray-700 ${
          disabled ? "[&>svg]:text-gray-300" : "hover:bg-gray-700"
        }  `}
        onPress={onPress}
      >
        {children}
      </Button>
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
