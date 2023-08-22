import { Switch, type SwitchProps } from "react-aria-components";

interface MySwitchProps extends Omit<SwitchProps, "children"> {
  children: React.ReactNode;
}

export function ToolbarSwitch({ children, ...props }: MySwitchProps) {
  return (
    <Switch
      {...props}
      className="group flex items-center gap-2"
    >
      <div
        className="group-data-[selected]-transition-colors h-6 w-10 rounded-full border-2 border-gray-500 
       bg-gray-900 duration-200 before:my-auto before:block before:h-5 before:w-5 before:rounded-full before:bg-blue-500
        before:duration-200 before:content-[''] group-data-[selected]:border-blue-500 group-data-[selected]:bg-blue-500 group-data-[selected]:before:translate-x-[80%]"
      />
      <div className="text-white-600">{children}</div>
    </Switch>
  );
}
