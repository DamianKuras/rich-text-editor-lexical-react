import { useCallback, useState } from "react";
import { $createParagraphNode } from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Label,
  Modal,
  ModalOverlay,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { VscChromeClose } from "react-icons/vsc";
import { FaColumns } from "react-icons/fa";
import { $createColumnContainerNode } from "../nodes/ColumnsContainerNode";
import { $createColumnNode } from "../nodes/ColumnNode";
import { TooltipButton } from "../ui/TooltipButton";

export default function ColumnPlugin() {
  const [editor] = useLexicalComposerContext();
  const [columns, setColumns] = useState<number>(2);
  const [gap, setGap] = useState<number>(0);

  const createColumnContainer = useCallback(
    (close: () => void) => {
      editor.update(() => {
        const node = $createParagraphNode();
        const container = $createColumnContainerNode(columns, gap);
        for (let i = 0; i < columns; i++) {
          if (i === 0) {
            container.append($createColumnNode().append(node));
          } else {
            container.append(
              $createColumnNode().append($createParagraphNode())
            );
          }
        }
        $insertNodeToNearestRoot(container);
        node.select();
        close();
      });
    },
    [columns, gap, editor]
  );

  return (
    <DialogTrigger>
      <TooltipButton tooltipMessage="Add column grid">
        <FaColumns />
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
                  <Heading className="pr-8 text-3xl text-white-600">
                    Add Columns Grid
                  </Heading>

                  <TooltipButton
                    tooltipMessage="Close overlay"
                    onPress={close}
                    className="bg-red-500 text-white-600 hover:bg-red-300"
                  >
                    <VscChromeClose />
                  </TooltipButton>
                </div>
                <div className="flex gap-2 bg-gray-900 px-8 py-4">
                  <Slider
                    className="relative"
                    value={columns}
                    onChange={setColumns}
                    minValue={2}
                    maxValue={6}
                    step={1}
                  >
                    <div className="flex justify-between">
                      <div className="mr-4 text-white-600">
                        <Label className="text-white-600">
                          Number of Columns:
                        </Label>
                      </div>
                      <SliderOutput className="min-w-[2em] text-white-600" />
                    </div>
                    <SliderTrack className="relative mt-2 h-1 border-2 border-gray-500 bg-blue-500">
                      <SliderThumb className="block h-5 w-5 rounded-full bg-blue-500 " />
                    </SliderTrack>
                  </Slider>
                </div>
                <div className="flex gap-2 bg-gray-900 px-8 py-4">
                  <Slider
                    className="relative"
                    value={gap}
                    onChange={setGap}
                    minValue={0}
                    maxValue={6}
                    step={1}
                  >
                    <div className="flex justify-between">
                      <div className="mr-4 text-white-600">
                        <Label className="text-white-600">
                          Gap between Columns:
                        </Label>
                      </div>
                      <SliderOutput className="min-w-[2em] text-white-600" />
                    </div>
                    <SliderTrack className="relative mt-2 h-1 border-2 border-gray-500 bg-blue-500">
                      <SliderThumb className="block h-5 w-5 rounded-full bg-blue-500 " />
                    </SliderTrack>
                  </Slider>
                </div>
                <div className="flex gap-2 bg-gray-900 px-8 pb-8 pt-4">
                  <Button
                    onPress={() => createColumnContainer(close)}
                    className="flex items-center bg-green-700 px-2 py-2 text-white-500 outline-none hover:bg-green-600"
                  >
                    Create
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
