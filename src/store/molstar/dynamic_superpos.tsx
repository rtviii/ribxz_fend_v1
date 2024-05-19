import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { Asset } from "molstar/lib/mol-util/assets";
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { compile } from "molstar/lib/mol-script/runtime/query/compiler";
import { StructureSelection } from "molstar/lib/mol-model/structure/query/selection";
import { superpose } from 'molstar/lib/mol-model/structure/structure/util/superposition'
import { QueryContext } from "molstar/lib/mol-model/structure/query/context";
import { StateObjectRef } from "molstar/lib/mol-state/object";
import { Expression } from "molstar/lib/mol-script/language/expression";
import { PluginStateObject as PSO } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { Mat4 } from "molstar/lib/mol-math/linear-algebra/3d/mat4";


// *----------------------------------------------------------------------------*
// * return dynamicSuperpositionTest(this.plugin, ['1tqn', '2hhb', '4hhb'], 'HEM');
// *----------------------------------------------------------------------------*

function transform(plugin: PluginContext, s: StateObjectRef<PSO.Molecule.Structure>, matrix: Mat4) {
    const b = plugin.state.data.build().to(s).insert(StateTransforms.Model.TransformStructureConformation, { transform: { name: 'matrix', params: { data: matrix, transpose: false } } });
    return plugin.runTask(plugin.state.data.updateTree(b));
}

async function loadStructure(plugin: PluginContext, url: string, format: BuiltInTrajectoryFormat, assemblyId?: string) {
    const data       = await plugin.builders.data.download({ url: Asset.Url(url) });
    const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
    const model      = await plugin.builders.structure.createModel(trajectory);
    const structure  = await plugin.builders.structure.createStructure(model, assemblyId ? { name: 'assembly', params: { id: assemblyId } } : void 0);

    return { data, trajectory, model, structure };
}

async function siteVisual(plugin: PluginContext, s: StateObjectRef<PSO.Molecule.Structure>, pivot: Expression, 
    // rest: Expression
    ) {
    const center = await plugin.builders.structure.tryCreateComponentFromExpression(s, pivot, 'pivot');
    if (center) await plugin.builders.structure.representation.addRepresentation(center, { type: 'ball-and-stick', color: 'residue-name' });

    // const surr = await plugin.builders.structure.tryCreateComponentFromExpression(s, rest, 'rest');
    // if (surr) await plugin.builders.structure.representation.addRepresentation(surr, { type: 'ball-and-stick', color: 'uniform', size: 'uniform', sizeParams: { value: 0.33 } });
}

export function dynamicSuperpositionTest(plugin: PluginContext, src: [string,string][], comp_id: string) {

    return plugin.dataTransaction(async () => {

        // for (const [ rcsb_id,aaid ] of src) {
        //     await loadStructure(plugin, `http://localhost:8000/mmcif_structures/chain?rcsb_id=${rcsb_id}&auth_asym_id=${aaid}`, 'mmcif');
        // }

        // const pivot = MS.struct.filter.first([
        //     MS.struct.generator.atomGroups({
        //         'residue-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_comp_id(), comp_id]),
        //         'group-by'    : MS.struct.atomProperty.macromolecular.residueKey()
        //     })
        // ]);

        const pivot = MS.struct.filter.first([
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.auth_asym_id(), comp_id]),
                'group-by'    : MS.struct.atomProperty.macromolecular.auth_asym_id
            })
        ]);

        // const rest = MS.struct.modifier.exceptBy({
        //     0: MS.struct.modifier.includeSurroundings({ 0: pivot, radius: 5 }), 
        //     by: pivot
        // });

        const query      = compile<StructureSelection>(pivot);
        const xs         = plugin.managers.structure.hierarchy.current.structures;

        const selections = xs.map(s => StructureSelection.toLociWithCurrentUnits(query(new QueryContext(s.cell.obj!.data))));

        const transforms = superpose(selections);

        // await siteVisual(plugin, xs[0].cell, pivot, rest);
        await siteVisual(plugin, xs[0].cell, pivot)

        for (let i = 1; i < selections.length; i++) {

            await transform(plugin, xs[i].cell, transforms[i - 1].bTransform);

            // await siteVisual(plugin, xs[i].cell, pivot, rest);
            await siteVisual(plugin, xs[i].cell, pivot)
        }
    });
}
