import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $dfs } from "@lexical/utils";
import { $getRoot, $isTextNode, TextNode } from "lexical";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Modal,
  ModalOverlay,
  Popover,
  TextField,
} from "react-aria-components";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineFindReplace } from "react-icons/md";
import { VscChromeClose } from "react-icons/vsc";
import { ToolbarSwitch } from "../ui/ToolbarSwitch";
import { TooltipButton } from "../ui/TooltipButton";

export function FindAndReplacePlugin() {
  const [editor] = useLexicalComposerContext();
  const [searchStr, setSearchStr] = useState<string>("");
  const [replaceStr, setReplaceStr] = useState<string>("");
  const [matchesPos, setMatchesPos] = useState(0);
  const [matchCase, setMatchCase] = useState(false);
  const [matchFullWordsOnly, setMatchFullWordsOnly] = useState(false);
  const [matches, setMatches] = useState<{ node: TextNode; index: number }[]>(
    []
  );

  function scrollIntoSelection() {
    const selection = window.getSelection();
    if (selection == null) {
      return;
    }
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const boundingRect = range.getBoundingClientRect();
      const scrollElement = document.getElementById("editor");

      if (scrollElement) {
        const scrollLeft =
          boundingRect.left +
          scrollElement.scrollLeft -
          scrollElement.getBoundingClientRect().left;
        const scrollTop =
          boundingRect.top +
          scrollElement.scrollTop -
          scrollElement.getBoundingClientRect().top;

        window.scrollTo({
          left: scrollLeft,
          top: scrollTop,
          behavior: "smooth",
        });
      }
    }
  }

  function nextMatch() {
    editor.update(() => {
      const nextMatchPos =
        matchesPos + 1 <= matches.length ? matchesPos + 1 : 1;
      const match = matches[nextMatchPos - 1];
      match.node.select(match.index, match.index + searchStr.length);
      setMatchesPos(nextMatchPos);
    });
    setTimeout(() => {
      scrollIntoSelection();
    }, 0);
  }
  function prevMatch() {
    editor.update(() => {
      const nextMatchPos =
        matchesPos - 1 >= 1 ? matchesPos - 1 : matches.length;
      const match = matches[nextMatchPos - 1];
      match.node.select(match.index, match.index + searchStr.length);
      setMatchesPos(nextMatchPos);
    });
    setTimeout(() => {
      scrollIntoSelection();
    }, 0);
  }

  function ReplaceSelected() {
    editor.update(() => {
      const match = matches[matchesPos - 1];
      const nodeTextContent = match.node.getTextContent();
      const updatedNodeTextContent =
        nodeTextContent.substring(0, match.index) +
        replaceStr +
        nodeTextContent.substring(match.index + searchStr.length);
      match.node.setTextContent(updatedNodeTextContent);
      const newMatches = matches
        .filter((item) => item != match)
        .map((item) => {
          //update indexes in the same node past match occurence
          if (
            item.node.getKey() == match.node.getKey() &&
            item.index > match.index
          )
            item.index -= searchStr.length - replaceStr.length;
          return item;
        });
      setMatches(newMatches);
      const nextmatch = newMatches[matchesPos - 1];
      if (newMatches.length > 0) {
        nextmatch.node.select(
          nextmatch.index,
          nextmatch.index + searchStr.length
        );
        setTimeout(() => {
          scrollIntoSelection();
        }, 0);
      } else {
        setMatchesPos(0);
      }
    });
  }

  function ReplaceAll() {
    editor.update(() => {
      Find();
      if (matches.length > 0) {
        for (const match of matches) {
          match.node.setTextContent(
            match.node.getTextContent().replace(searchStr, replaceStr)
          );
        }
      }
    });
  }
  function Find() {
    if (searchStr === "") {
      setMatches([]);
      setMatchesPos(0);
      return;
    }
    editor.update(() => {
      const root = $getRoot();
      const nodes = $dfs(root);
      const flags = matchCase ? "g" : "gi";
      const regexStr = matchFullWordsOnly ? `\\b${searchStr}\\b` : searchStr;
      const regex = new RegExp(regexStr, flags);
      const newMatches = [];

      for (const node of nodes) {
        if ($isTextNode(node.node)) {
          const text = node.node.getTextContent();
          let result;
          while ((result = regex.exec(text)))
            newMatches.push({ node: node.node, index: result.index });
        }
      }
      if (newMatches.length > 0) {
        newMatches[0].node.select(
          newMatches[0].index,
          newMatches[0].index + searchStr.length
        );
        setMatches(newMatches);
        setMatchesPos(1);
        setTimeout(() => {
          scrollIntoSelection();
        }, 0);
      } else {
        setMatchesPos(0);
        setMatches([]);
      }
    });
  }

  return (
    <DialogTrigger>
      <TooltipButton tooltipMessage="Find and replace">
        <MdOutlineFindReplace />
      </TooltipButton>
      <ModalOverlay
        isDismissable={true}
        className="react-aria-ModalOverlay fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-blue-500 bg-opacity-10"
      >
        <Modal className="react-aria-Modal fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center ">
          <Dialog>
            {({ close }) => (
              <>
                <div className="sticky top-0 z-10 flex justify-between bg-gray-900 px-8 py-8">
                  <Heading className="text-3xl text-white-600">
                    Find and Replace
                  </Heading>
                  <div className="flex gap-2">
                    <DialogTrigger>
                      <TooltipButton
                        tooltipMessage="Settings"
                        className="bg-gray-500"
                      >
                        <IoSettingsSharp />
                      </TooltipButton>
                      <Popover className="react-aria-Popover">
                        <Dialog>
                          <div className="bg-gray-900 px-8 py-8 shadow-lg">
                            <div className="mb-8">
                              <div className="mb-4 flex justify-between">
                                <ToolbarSwitch
                                  id="matchCase"
                                  isSelected={matchCase}
                                  onChange={setMatchCase}
                                >
                                  Match case sensitive
                                </ToolbarSwitch>
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <ToolbarSwitch
                                id="wholeWordsOnly"
                                isSelected={matchFullWordsOnly}
                                onChange={setMatchFullWordsOnly}
                              >
                                Whole words only
                              </ToolbarSwitch>
                            </div>
                          </div>
                        </Dialog>
                      </Popover>
                    </DialogTrigger>

                    <TooltipButton
                      tooltipMessage="Close overlay"
                      onPress={close}
                      className="bg-red-500 text-white-600 hover:bg-red-300"
                    >
                      <VscChromeClose />
                    </TooltipButton>
                  </div>
                </div>
                <div className="bg-gray-900 px-8 py-8 shadow-lg">
                  <div className="mb-4 flex">
                    <TextField
                      autoFocus
                      className="flex flex-row"
                      value={searchStr}
                      onChange={setSearchStr}
                    >
                      <Label className="my-auto mr-2 text-white-500">
                        Find in text:
                      </Label>
                      <Input className="bg-gray-500 px-2 text-white-500 outline-none" />
                    </TextField>
                    <div className="ml-2 flex justify-between bg-gray-500">
                      <div className="flex gap-1">
                        <TooltipButton
                          tooltipMessage="Find"
                          className="bg-green-500 text-white-500 hover:bg-green-400"
                          onPress={Find}
                        >
                          Find
                        </TooltipButton>
                        <TooltipButton
                          tooltipMessage="Previous occurence"
                          onPress={prevMatch}
                        >
                          <FaArrowUp />
                        </TooltipButton>
                        <TooltipButton
                          tooltipMessage="Next occurence"
                          onPress={nextMatch}
                        >
                          <FaArrowDown />
                        </TooltipButton>
                        <div className="my-auto flex h-full items-center bg-blue-500 px-1 text-white-500">
                          {matchesPos}/{matches.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex gap-2 ">
                    <TextField
                      className="flex flex-row"
                      value={replaceStr}
                      onChange={setReplaceStr}
                    >
                      <Label className="my-auto mr-2 text-white-500">
                        Replace with:
                      </Label>
                      <Input className="bg-gray-500 px-2 text-white-500 outline-none" />
                    </TextField>
                    <div className="flex gap-1">
                      <TooltipButton
                        tooltipMessage="Replace"
                        onPress={ReplaceSelected}
                        className="bg-green-500 text-white-500 hover:bg-green-400"
                      >
                        Replace Selected
                      </TooltipButton>
                      <TooltipButton
                        className="bg-blue-500 text-white-500 hover:bg-blue-300"
                        tooltipMessage="Replace All"
                        onPress={ReplaceAll}
                      >
                        Replace All
                      </TooltipButton>
                    </div>
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
