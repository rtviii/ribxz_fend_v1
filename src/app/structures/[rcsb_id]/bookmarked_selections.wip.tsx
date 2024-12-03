import { ribxzMstarv2 } from "@/components/mstar/mstarv2";
import { useAppSelector } from "@/store/store";
import { useState } from "react";


const BookmarkTab = ({label, onClick}: {label: string; onClick: () => void}) => (
    <div className="group">
        <div
            onClick={onClick}
            className="
      px-2 pr-4 py-1 bg-white border border-gray-200 rounded-r-md shadow-sm cursor-pointer
      hover:bg-gray-50 text-[10px] w-10 overflow-hidden
      transition-all duration-250 ease-in-out
      group-hover:w-auto group-hover:max-w-[200px]
    ">
            <span className="block truncate">{label}</span>
        </div>
    </div>
);
export const BookmarkedSelections: React.FC<{
    leftPanelWidth:number
}> = ({
    leftPanelWidth
}) => {

    const selections = useAppSelector(state => state.structure_page.saved_selections);
    const bookmarks = Object.keys(selections);
    const [ctx, setCtx] = useState<ribxzMstarv2 | null>(null);

    return (
        <div
            className="absolute top-4 left-0 z-10 flex flex-col space-y-2"
            style={{transform: `translateX(${leftPanelWidth}px)`}}>
            {' '}
            {bookmarks.map((bookmark, index) => (
                <BookmarkTab
                    key={index}
                    label={bookmark}
                    onClick={() => {
                        ctx?.ctx.managers.structure.selection.clear();
                    }}
                />
            ))}
        </div>
    );
};
