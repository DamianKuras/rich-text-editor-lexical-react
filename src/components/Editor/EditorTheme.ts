export const EditorTheme = {
  ltr: "text-left",
  rtl: "text-right",
  paragraph: "mb-4",
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
    underlineStrikethrough: "custom-underline-strikethrough",
  },
  quote: "border-l-4 my-4 text-lg ml-4 pl-4",
  heading: {
    h1: "text-2xl",
    h2: "text-xl",
    h3: "text-lg",
  },
  list: {
    listitem: "mb-2",
    nested: {
      listitem: "list-none",
    },
    olDepth: [
      "list-inside list-decimal",
      "pl-4 list-inside list-decimal",
      "pl-8 list-inside list-decimal",
      "pl-12 list-inside list-decimal",
      "pl-16 list-inside list-decimal",
    ],
    ul: "list-disc ml-4",
  },
};
