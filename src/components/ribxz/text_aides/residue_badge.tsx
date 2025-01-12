import {Badge} from '@/components/ui/badge';
// ----------------------------------------------------------------------------------------
// Shapely Color Table for Amino Acids

import {MolstarRibxz, Residue} from '../../mstar/__molstar_ribxz';

// name                 color              RGB Values          Hexadecimal
const AminoAcidColorTable: Record<string, {color_name: string; rgb: number[]; hex: string}> = {
    ASP: {color_name: 'bright red', rgb: [230, 10, 10], hex: '#e60a0a'},
    GLU: {color_name: 'bright red', rgb: [230, 10, 10], hex: '#e60a0a'},
    MET: {color_name: 'yellow', rgb: [230, 230, 0], hex: '#e6e600'},
    CYS: {color_name: 'yellow', rgb: [230, 230, 0], hex: '#e6e600'},
    LYS: {color_name: 'blue', rgb: [20, 90, 255], hex: '#145aff'},
    ARG: {color_name: 'blue', rgb: [20, 90, 255], hex: '#145aff'},
    SER: {color_name: 'orange', rgb: [250, 150, 0], hex: '#fa9600'},
    THR: {color_name: 'orange', rgb: [250, 150, 0], hex: '#fa9600'},
    TYR: {color_name: 'mid blue', rgb: [50, 50, 170], hex: '#3232aa'},
    PHE: {color_name: 'mid blue', rgb: [50, 50, 170], hex: '#3232aa'},
    ASN: {color_name: 'cyan', rgb: [0, 220, 220], hex: '#00dcdc'},
    GLN: {color_name: 'cyan', rgb: [0, 220, 220], hex: '#00dcdc'},
    GLY: {color_name: 'light grey', rgb: [235, 235, 235], hex: '#ebebeb'},
    ILE: {color_name: 'green', rgb: [15, 130, 15], hex: '#0f820f'},
    VAL: {color_name: 'green', rgb: [15, 130, 15], hex: '#0f820f'},
    LEU: {color_name: 'green', rgb: [15, 130, 15], hex: '#0f820f'},
    ALA: {color_name: 'dark grey', rgb: [200, 200, 200], hex: '#c8c8c8'},
    TRP: {color_name: 'pink', rgb: [180, 90, 180], hex: '#b45ab4'},
    HIS: {color_name: 'pale blue', rgb: [130, 130, 210], hex: '#8282d2'},
    PRO: {color_name: 'flesh', rgb: [220, 150, 130], hex: '#dc9682'}
};

// Shapely Color Table for Nucleosides in DNA & RNA Nucleoside 	Color Name 	RGB Values 	Hexadecimal
const NucleotidesColorTable: Record<string, {color_name: string; rgb: number[]; hex: string}> = {
    A: {color_name: 'light blue', rgb: [160, 160, 255], hex: '#a0a0ff'},
    C: {color_name: 'orange', rgb: [255, 140, 75], hex: '#ff8c4b'},
    G: {color_name: 'light red', rgb: [255, 112, 112], hex: '#ff7070'},
    T: {color_name: 'light green', rgb: [160, 255, 160], hex: '#a0ffa0'},
    U: {color_name: 'dark grey', rgb: [184, 184, 184], hex: '#b8b8b8'}
};

export const ResidueBadge = ({
    residue,
    molstar_ctx,
    show_parent_chain
}: {
    residue: Residue;
    molstar_ctx: MolstarRibxz | null;
    show_parent_chain?: boolean;
}) => {
    const residue_color_border = () => {
        if (residue.label_comp_id === undefined || residue.label_comp_id === null) {
            return ['#0c0a09', 'border'];
        } else if (Object.keys(NucleotidesColorTable).includes(residue.label_comp_id)) {
            return [NucleotidesColorTable[residue.label_comp_id].hex, 'border'];
        } else if (Object.keys(AminoAcidColorTable).includes(residue.label_comp_id)) {
            return [AminoAcidColorTable[residue.label_comp_id].hex, 'border-dashed'];
        } else {
            return ['#0c0a09', 'border'];
        }
    };
    var [color, border] = residue_color_border();

    return (
        <div
            onClick={() => {
                molstar_ctx?.select_residueCluster([
                    {
                        auth_seq_id: residue.auth_seq_id,
                        auth_asym_id: residue.auth_asym_id
                    }
                ]);
            }}
            onMouseEnter={() => {
                molstar_ctx?.highlightResidueCluster([
                    {
                        auth_seq_id: residue.auth_seq_id,
                        auth_asym_id: residue.auth_asym_id
                    }
                ]);
            }}
            onMouseLeave={() => {
                molstar_ctx?.removeHighlight();
            }}
            className="flex flex-col  w-fit hover:cursor-pointer hover:bg-muted rounded-sm p-1">
            <Badge variant="outline" className={`hover:bg-muted hover:cursor-pointer  ${border}  border-2`}>
                <div className="flex flex-row justify-between w-fit ">
                    <span className="text-xs font-bold w-fit px-1 text-center" style={{color: color}}>
                        {residue.label_comp_id}
                    </span>
                    <span className="text-xs font-light w-fit px-1 text-center text-black">{residue.auth_seq_id}</span>
                    {/* <span className="text-xs font-light w-fit px-1 text-center text-black">{residue.label_seq_id}</span> */}
                </div>
                {show_parent_chain ? (
                    <div className="flex flex-row justify-between w-fit border-l-2 ">
                        <span className="text-xs w-fit font-medium px-1 text-black">{residue.polymer_class}</span>
                        <span className="text-xs w-fit font-light px-1 text-black">{residue.auth_asym_id}</span>
                    </div>
                ) : null}
            </Badge>
        </div>
    );
};
