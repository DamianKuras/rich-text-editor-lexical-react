import type { ListBoxItemProps, SelectProps } from "react-aria-components";
import {
  Button,
  ListBoxItem,
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
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ToolbarSelect<T extends object>({
  description,
  errorMessage,
  children,
  items,
  ...props
}: Readonly<MySelectProps<T>>) {
  return (
    <Select {...props}>
      <Button
        className={`flex items-center px-4 py-2 outline-none data-[pressed]:bg-gray-700`}
      >
        <SelectValue className="text-white-600" />
        <span aria-hidden="true">
          <IoMdArrowDropdown />
        </span>
      </Button>
      {description && <Text slot="description">{description}</Text>}
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      <Popover className="react-aria-Popover bg-gray-900 ">
        <ListBox className={`mx-auto overflow-auto outline-none`} items={items}>
          {children}
        </ListBox>
      </Popover>
    </Select>
  );
}

export function SelectItem(props: Readonly<ListBoxItemProps>) {
  return (
    <ListBoxItem
      {...props}
      className={({ isFocused, isSelected }) =>
        `relative  px-6 py-2 text-white-600 outline-none ${
          isFocused
            ? "cursor-default border-none bg-blue-400 outline-none hover:bg-blue-400"
            : ""
        } ${
          isSelected
            ? "before:absolute before:left-2 before:top-2 before:text-green-500 before:content-['✓']"
            : "before:content-[' ']"
        }`
      }
    />
  );
}
