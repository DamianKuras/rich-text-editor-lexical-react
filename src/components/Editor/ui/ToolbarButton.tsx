import { ReactNode } from "react";

type Props = {
  title: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  clicked?: boolean;
};

export function ToolbarButton({
  title,
  className,
  onClick,
  children,
  disabled,
  clicked,
}: Props): JSX.Element {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`${className ? className + " " : ""}px-2 pb-2 pt-1 ${
        disabled
          ? "[&>svg]:text-toolbar-disabled cursor-not-allowed"
          : "hover:bg-toolbar-hover"
      } ${clicked ? "bg-toolbar-clicked" : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
