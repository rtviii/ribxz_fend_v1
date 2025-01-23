import {InputNumber, TreeSelect} from 'antd';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {LigandInstances, set_current_ligand, set_ligands_radius} from '@/store/slices/slice_ligands';
import {capitalize_only_first_letter_w} from '@/my_utils';
import {useState} from 'react';

export default function LigandSelection() {
    const lig_data_to_tree = (lig_data: LigandInstances) => {
        return lig_data.map(([lig, structs]) => ({
            key: lig.chemicalId,
            value: lig.chemicalId,
            title: (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                    <span className="font-semibold">{lig.chemicalId}</span>
                    <span style={{}}>
                        {lig.chemicalName.length > 30
                            ? capitalize_only_first_letter_w(lig.chemicalName).slice(0, 40) + '...'
                            : capitalize_only_first_letter_w(lig.chemicalName)}
                    </span>
                </div>
            ),

            // `${lig.chemicalId} (${lig.chemicalName.length > 30 ?  capitalize_only_first_letter_w(lig.chemicalName).slice(0,30)+"..." : capitalize_only_first_letter_w(lig.chemicalName) })`,
            selectable: false, // Make the parent node not selectable
            search_aggregator: (
                lig.chemicalName +
                lig.chemicalId +
                structs.reduce((acc: string, next) => acc + next.rcsb_id + next.tax_node.scientific_name, '')
            ).toLowerCase(),
           children: structs.map((struct, index) => ({
                search_aggregator: (
                    lig.chemicalName +
                    lig.chemicalId +
                    struct.rcsb_id +
                    struct.tax_node.scientific_name
                ).toLowerCase(),
                key: `${lig.chemicalId}_${struct.rcsb_id}`,
                value: `${lig.chemicalId}_${struct.rcsb_id}`,
                title: (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                        <span>
                            <span style={{fontWeight: 'bold'}}>{lig.chemicalId}</span> in{' '}
                            <span style={{fontWeight: 'bold'}}>{struct.rcsb_id}</span>
                        </span>
                        <span style={{fontStyle: 'italic'}}>{struct.tax_node.scientific_name}</span>
                    </div>
                ),
                selectable: true // Make the child nodes selectable
            }))
        }));
    };
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const lig_state = useAppSelector(state => state.ligands_page);

    const [radChanged, setRadChanged] = useState(false);
    const dispatch = useAppDispatch();
    return (
        <div className="flex flex-row space-x-4">
            <TreeSelect
                status={current_ligand === null ? 'warning' : undefined}
                showSearch={true}
                treeNodeFilterProp="search_aggregator" // Changed from 'search_front' to 'title'
                placeholder="Select ligand-structure pair..."
                variant="outlined"
                treeData={lig_data_to_tree(lig_state.data)}
                className="w-full"
                treeExpandAction="click"
                showCheckedStrategy="SHOW_CHILD"
                filterTreeNode={(input, treenode) => {
                    return (treenode.search_aggregator as string).includes(input.toLowerCase());
                }}
                onChange={(value: string, _) => {
                    var [chemId, rcsb_id_selected] = value.split('_');
                    const lig_and_its_structs = lig_state.data.filter(kvp => {
                        var [lig, structs] = kvp;
                        return lig.chemicalId == chemId;
                    });
                    const struct = lig_and_its_structs[0][1].filter(s => s.rcsb_id == rcsb_id_selected)[0];
                    dispatch(
                        set_current_ligand({
                            ligand: lig_and_its_structs[0][0],
                            parent_structure: struct
                        })
                    );
                }}
            />
        </div>
    );
}
