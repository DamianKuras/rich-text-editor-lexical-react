import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { BsFillFileTextFill } from "react-icons/bs";
import { VscChromeClose } from "react-icons/vsc";
import { TooltipButton } from "../ui/TooltipButton";

function countWords(str: string) {
  const matches = str.match(/\S+/g);
  return matches ? matches.length : 0;
}

function countSentences(str: string) {
  const matches = str.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}

function calculateReadingTime(wordsCount: number) {
  const wordsPerMinute = 200;
  const minutes = Math.floor(wordsCount / wordsPerMinute);
  const seconds = Math.round(
    (60 * (wordsCount % wordsPerMinute)) / wordsPerMinute
  );
  return { minutes, seconds };
}

function countCharactersWithoutSpaces(str: string) {
  const matches = str.match(/\S/g); // Match all non-whitespace characters
  return matches ? matches.length : 0;
}

export function TextStatisticsPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [characterCountWithoutSpaces, setCharacterCountWithoutSpaces] =
    useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [readingTime, setReadingTime] = useState({ minutes: 0, seconds: 0 });

  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      const wordCounted = countWords(text);
      setWordCount(wordCounted);
      setCharacterCount(root.getTextContentSize());
      setCharacterCountWithoutSpaces(countCharactersWithoutSpaces(text));
      setSentenceCount(countSentences(text));
      setReadingTime(calculateReadingTime(wordCounted));
    });
    setIsOpen(true);
  }

  return (
    <DialogTrigger>
      <TooltipButton tooltipMessage="Show statistics" onPress={handleOpen}>
        <BsFillFileTextFill />
      </TooltipButton>
      <ModalOverlay
        isDismissable={true}
        className="react-aria-ModalOverlay fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-blue-200 bg-opacity-60"
      >
        <Modal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          className="react-aria-Modal "
        >
          <Dialog className="z-50 mx-auto my-auto max-h-[80vh] min-w-[20em] max-w-[80vw] overflow-auto bg-gray-800 outline-none">
            {({ close }) => (
              <>
                <div className="sticky top-0 z-10 flex justify-between bg-gray-700 p-2">
                  <Heading className="text-3xl text-white-600">
                    Statistics
                  </Heading>
                  <div className="flex gap-2">
                    <TooltipButton
                      tooltipMessage="Close overlay"
                      onPress={close}
                      className="bg-red-500 text-white-600 hover:bg-red-300"
                    >
                      <VscChromeClose />
                    </TooltipButton>
                  </div>
                </div>

                <div className="bg-gray-500 px-4 py-4 text-white-500">
                  <div className="mb-2 flex justify-between">
                    <span>Characters: </span> <span> {characterCount}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span>Characters excluding spaces: </span>
                    <span> {characterCountWithoutSpaces}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span>Words:</span> <span>{wordCount}</span>
                  </div>

                  <div className="mb-2 flex justify-between">
                    <span>Sentences:</span> <span>{sentenceCount}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span>Estimated reading time:</span>{" "}
                    <span>
                      {readingTime.minutes}m {readingTime.seconds}s
                    </span>
                  </div>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
