import type { ItemProps, SelectProps } from "react-aria-components";
import {
  Button,
  Item,
  ListBox,
  Popover,
  Select,
  SelectValue,
  Text,
} from "react-aria-components";
import { IoMdArrowDropdown } from "react-icons/io";

interface MySelectProps<T extends object>
  extends Omit<SelectProps<T>, "children"> {
  description?: string;
  errorMessage?: string;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  minWidth: string;
}

export function ToolbarSelect<T extends object>({
  description,
  errorMessage,
  children,
  minWidth,
  ...props
}: MySelectProps<T>) {
  return (
    <Select
      {...props}
      className="inline-block w-fit"
    >
      <Button
        className={`min-w-${minWidth} px-4 py-2 outline-none data-[pressed]:bg-gray-700`}
      >
        <SelectValue className="text-sm text-white-600" />
        <span aria-hidden="true">
          <IoMdArrowDropdown />
        </span>
      </Button>
      {description && <Text slot="description">{description}</Text>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      <Popover className="react-aria-Popover bg-gray-900 ">
        <ListBox
          className={`min-w-${minWidth} mx-auto overflow-auto outline-none outline-none`}
        >
          {children}
        </ListBox>
      </Popover>
    </Select>
  );
}

export type SelectItemProps = {
  name: string;
  id: React.Key;
};

export function SelectItem(props: ItemProps) {
  return (
    <Item
      {...props}
      className={({ isFocused, isSelected }) =>
        `relative py-1 pl-6 pr-2 text-sm text-white-600 outline-none md:py-2 ${
          isFocused
            ? "cursor-default border-none bg-blue-400 outline-none hover:bg-blue-400"
            : ""
        } ${
          isSelected
            ? "before:absolute before:left-2 before:top-2 before:text-green-500 before:content-['✓'] "
            : "before:content-[' ']"
        }`
      }
    />
  );
}
