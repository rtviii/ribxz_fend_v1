import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {IconVisibilityOn, IconVisibilityOff, IconToggleSpin} from '@/components/ribxz/icons/visibility_icon';

export default function Controls() {
    const [structVisibility, setStructVisibility] = useState<boolean>(true);
    return (
        <div className="flex flex-row w-full justify-between">
            <Button
                onClick={() => {
                    setRadChanged(false);
                    if (current_ligand === null || ctx === null) {
                        return;
                    }
                    // ctx.create_ligand_and_surroundings(
                    //     current_ligand?.ligand.chemicalId,
                    //     lig_state.radius
                    // )
                    //     .then(ctx =>
                    //         ctx.get_selection_constituents(
                    //             current_ligand?.ligand.chemicalId,
                    //             lig_state.radius
                    //         )
                    //     )
                    //     .then(residues => {
                    //         setSurroundingResidues(residues);
                    //     });
                }}
                variant={'outline'}
                disabled={current_ligand === null}
                className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border
                     hover:bg-gray-100 rounded-l-lg  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ${
                         radChanged
                             ? ' outline-green-200 shadow-md shadow-green-400 rounded-sm   transition-all duration-200'
                             : null
                     }  `}>
                Render
            </Button>
            <Button
                onMouseEnter={() => {
                    // ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['highlight']);
                }}
                onMouseLeave={() => {
                    // ctx?.removeHighlight();
                }}
                onClick={() => {
                    // ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, [
                    //     'select',
                    //     'focus'
                    // ]);
                }}
                variant={'secondary'}
                disabled={current_ligand === null}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border  hover:bg-gray-100 rounded-l-lg  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ">
                Ligand
            </Button>
            <Button
                variant={'secondary'}
                onMouseEnter={() => {
                    // ctx?.select_focus_ligand_surroundings(
                    //     current_ligand?.ligand.chemicalId,
                    //     lig_state.radius,
                    //     ['highlight']
                    // );
                }}
                onMouseLeave={() => {
                    // ctx?.removeHighlight();
                }}
                onClick={() => {
                    // ctx?.select_focus_ligand_surroundings(
                    //     current_ligand?.ligand.chemicalId,
                    //     lig_state.radius,
                    //     ['select', 'focus']
                    // );
                }}
                disabled={current_ligand === null}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 border-t border-b border-r  rounded-r-md  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ">
                Binding Site
            </Button>

            <Button
                variant={'secondary'}
                className="text-xs  text-gray-900 bg-white border  hover:bg-gray-100 "
                onClick={() => {
                    // ctx?.toggle_visibility_by_ref(structRepresentation, structVisibility);
                    // setStructVisibility(!structVisibility);
                }}>
                <div className=" flex-row p-1 rounded-sm flex items-center content-center align-middle justify-center gap-2 ">
                    <span>Toggle Structure Visibility</span>
                    <div>
                        {!structVisibility ? (
                            <div>
                                {' '}
                                <IconVisibilityOff className="w-6 h-6" />
                            </div>
                        ) : (
                            <div>
                                <IconVisibilityOn className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </div>
            </Button>
            <Button
                variant={'secondary'}
                className="text-xs   text-gray-900 bg-white border  hover:bg-gray-100 "
                onClick={() => {
                    // ctx?.toggleSpin();
                }}>
                <div className="flex items-center content-center align-middle  flex-row p-1 rounded-sm justify-between gap-2 ">
                    <span>Toggle Spin</span>
                    <div>
                        <IconToggleSpin className="w-6 h-6 flex items-center content-center align-middle justify-center" />
                    </div>
                </div>
            </Button>
        </div>
    );
}
