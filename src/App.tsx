import { Editor } from "./components/Editor";
import { SettingContextProvider } from "./components/Editor/context/SettingsContext";
import { Header } from "./components/Header";

function App() {
  return (
    <>
      <Header />
      <SettingContextProvider>
        <Editor />
      </SettingContextProvider>
    </>
  );
}

export default App;
