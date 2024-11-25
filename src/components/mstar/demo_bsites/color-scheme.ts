import { isPositionLocation } from 'molstar/lib/mol-geo/util/location-iterator';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra';
import { StructureElement } from 'molstar/lib/mol-model/structure/structure/element';
import { ColorTheme, LocationColor } from 'molstar/lib/mol-theme/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { Color } from 'molstar/lib/mol-util/color';
import { ColorNames } from 'molstar/lib/mol-util/color/names';
import { Location } from 'molstar/lib/mol-model/location';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { StructureProperties } from 'molstar/lib/mol-model/structure/structure/properties';
import { ScoredBsite } from './molstar_demo_bsites';
import { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';

export const VaryingResidueColorThemeParams = {
    bsite: PD.Value<ScoredBsite>({}),
};

export type VaryingResidueColorThemeParams = typeof VaryingResidueColorThemeParams
export function getResidueColorThemeParams(ctx: ThemeDataContext) {
    return VaryingResidueColorThemeParams;
}

// ----------------
export function VaryingResidueTheme(
    ctx: ThemeDataContext,
    props: PD.Values<VaryingResidueColorThemeParams>
): ColorTheme<VaryingResidueColorThemeParams> {

    const bsite = props.bsite
    const color: LocationColor = (location: Location): Color => {
        return ColorNames.red
        // if (StructureElement.Location.is(location)) {
        //     const auth_seq_id = StructureProperties.residue.auth_seq_id(location)
        //     const auth_asym_id = StructureProperties.chain.auth_asym_id(location)

        //     if (auth_asym_id in Object.keys(bsite) && auth_seq_id in Object.keys(bsite[auth_asym_id])) {
        //         return ColorNames.blue
        //     }
        //     else {
        //         return ColorNames.gray;
        //     }
        // }
        // else{
        //     return ColorNames.gray
        // }
    };

    return {
        factory: VaryingResidueTheme,
        granularity: 'group',
        color: color,
        props: props,
        description: 'Per atom color color theme',
    };
}



export const VaryingResidueColorThemeProvider: ColorTheme.Provider<VaryingResidueColorThemeParams, 'varying-residue-theme'> = {
    name         : 'varying-residue-theme',
    label        : 'Custom Color Theme',
    category     : ColorTheme.Category.Misc,
    factory      : VaryingResidueTheme,
    defaultValues: PD.getDefaultValues(VaryingResidueColorThemeParams),
    getParams    : getResidueColorThemeParams,
    isApplicable : (ctx: ThemeDataContext) => true,
}


