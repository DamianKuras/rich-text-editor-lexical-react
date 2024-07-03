import { IconContext } from "react-icons";
import { ImGithub } from "react-icons/im";
const IconContextValue = { className: "w-6 h-6 inline-block" };
export function Header() {
  return (
    <header className="p-10 text-white-800">
      <h1 className="text-center text-3xl font-medium">
        <span className="text-green-500">Rich Text Editor</span> using Lexical
        and React
      </h1>
      <div className="my-6 text-center">
        <a
          href="https://github.com/DamianKuras/rich-text-editor-lexical-react"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center"
        >
          <span className="mr-2">Check out project on Github</span>
          <IconContext.Provider value={IconContextValue}>
            <ImGithub />
          </IconContext.Provider>
        </a>
      </div>
    </header>
  );
}
