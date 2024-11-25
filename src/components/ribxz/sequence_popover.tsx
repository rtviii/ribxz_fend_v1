import React, { useCallback, useContext, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { CopyIcon } from "./icons/icon_copy";
import { useToast } from "@/hooks/use-toast";
import { Polymer } from "@/store/ribxz_api/ribxz_api";
import { MolstarContext } from "../mstar/molstar_context";
import { range } from "lodash";

const ArrowIcon = ({ size = 15, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

const ToastDemo = () => {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        });
      }}
    >
      Show Toast
    </Button>
  );
};

const SequencePopover = ({
  sequence,
  seqType,
  polymer,
}: {
  sequence: string;
  seqType: "amino" | "rna";
  polymer?: Polymer;
}) => {
  const ctx = useContext(MolstarContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState({ start: -1, end: -1 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (index: number) => {
    setIsSelecting(true);
    setSelection({ start: index, end: index });
  };

  const handleMouseMove = (index: number) => {
    if (isSelecting) {
      setSelection((prev) => ({ ...prev, end: index }));
    }
  };

  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      const start = Math.min(selection.start, selection.end);
      const end = Math.max(selection.start, selection.end);
      if (polymer === undefined) {
        return;
      }
      var residues = [];
      if (start === end) {
        residues.push({
          auth_asym_id: polymer?.auth_asym_id,
          auth_seq_id: start,
        });
      } else {
        for (var res_ix of range(start, end + 1)) {
          residues.push({
            auth_asym_id: polymer?.auth_asym_id,
            auth_seq_id: res_ix,
          });
        }
      }
      console.log("ress----->", residues);
      ctx?.select_residueCluster(residues);
    }
  }, [selection, isSelecting, sequence]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        handleMouseUp();
      }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isSelecting, handleMouseUp]);

  const copySequence = () => {
    navigator.clipboard.writeText(sequence).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <ArrowUpRight
            size={24}
            className="border hover:bg-slate-200 hover:border-blue-300"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[800px] max-h-[400px] overflow-y-auto p-0 flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 bg-gray-100 flex justify-between items-center border-b">
          <span className="text-sm font-medium">
            {polymer === undefined
              ? `[${seqType}]`
              : polymer.rcsb_pdbx_description + `(${sequence.length} residues)`}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toast({ title: "Sequence Copied", description: "" });
              copySequence();
            }}
          >
            <CopyIcon props={{ size: 16, className: "mr-2" }} />
            Copy Sequence
          </Button>
        </div>
        <div
          ref={sequenceRef}
          className="font-mono text-sm whitespace-pre-wrap p-4"
          style={{ userSelect: "none" }}
        >
          {sequence.split("").map((char, index) => (
            <React.Fragment key={index}>
              <span
                className={`inline-block w-[1ch] text-center ${
                  (isSelecting || !isSelecting) &&
                  index >= Math.min(selection.start, selection.end) &&
                  index <= Math.max(selection.start, selection.end)
                    ? "bg-blue-200"
                    : ""
                }`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(index);
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  handleMouseMove(index);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleMouseUp();
                }}
              >
                {char}
              </span>
              {(index + 1) % 10 === 0 && (
                <span className="relative inline-block">
                  <span className="mr-4" /> {/* Add extra space here */}
                  <sub
                    className="absolute text-[0.6em] text-gray-400 bottom-3 left-0"
                    style={{ pointerEvents: "none" }}
                  >
                    {(index + 1).toString().padStart(4, "0")}
                  </sub>
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SequencePopover;
