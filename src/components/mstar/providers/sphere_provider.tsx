import { addSphere } from "molstar/lib/mol-geo/geometry/mesh/builder/sphere";
import { MeshBuilder } from 'molstar/lib/mol-geo/geometry/mesh/mesh-builder';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra';
import { Interval } from 'molstar/lib/mol-data/int';
import { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh';
import { LocationIterator } from "molstar/lib/mol-geo/util/location-iterator";
import { PickingId } from "molstar/lib/mol-geo/geometry/picking";
import { NullLocation } from "molstar/lib/mol-model/location";
import { DataLoci, EmptyLoci, Loci } from "molstar/lib/mol-model/loci";
import { Structure, Unit } from 'molstar/lib/mol-model/structure';
import { StructureRepresentation, StructureRepresentationProvider, StructureRepresentationStateBuilder, UnitsRepresentation } from 'molstar/lib/mol-repr/structure/representation';
import { Representation, RepresentationContext, RepresentationParamsGetter } from 'molstar/lib/mol-repr/representation';
import { UnitsMeshParams, UnitsMeshVisual, UnitsVisual } from 'molstar/lib/mol-repr/structure/units-visual';
import { StructureGroup } from 'molstar/lib/mol-repr/structure/visual/util/common';
import { VisualUpdateState } from 'molstar/lib/mol-repr/util';
import { VisualContext } from 'molstar/lib/mol-repr/visual';
import { Theme, ThemeRegistryContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';

// Add label to parameters
const ArbitrarySphereParams = {
    ...UnitsMeshParams,
    x: PD.Numeric(0),
    y: PD.Numeric(0),
    z: PD.Numeric(0),
    radius: PD.Numeric(1),
    label: PD.Text('PTC'), // Add configurable label
    selectable: PD.Boolean(true), // Add selectable flag
};
type ArbitrarySphereParams = typeof ArbitrarySphereParams;

const ArbitrarySphereVisuals = {
    'arbitrary-sphere': (ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, ArbitrarySphereParams>) =>
        UnitsRepresentation('Arbitrary sphere', ctx, getParams, ArbitrarySphereVisual),
};

function ArbitrarySphereVisual(materialId: number): UnitsVisual<ArbitrarySphereParams> {
    return UnitsMeshVisual<ArbitrarySphereParams>({
        defaultProps: PD.getDefaultValues(ArbitrarySphereParams),
        createGeometry: createArbitrarySphereMesh,
        createLocationIterator: (structureGroup: StructureGroup) => {
            return LocationIterator(1, structureGroup.group.units.length, 1, () => NullLocation)
        },
        getLoci: (pickingId: PickingId, structureGroup: StructureGroup, id: number, props: PD.Values<ArbitrarySphereParams>) => {
            const { objectId } = pickingId;
            if (objectId !== id || !props.selectable) return EmptyLoci;

            return DataLoci(
                'arbitrary-sphere-data-loci',
                {
                    x: props.x,
                    y: props.y,
                    z: props.z,
                    radius: props.radius,
                    label: props.label
                },
                [0],
                void 0,
                () => props.label
            );
        },
        eachLocation: (loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean, props: PD.Values<ArbitrarySphereParams>) => {
            if (!props.selectable) return false;
            
            if (loci.kind === 'data-loci' && loci.tag === 'arbitrary-sphere-data-loci') {
                return apply(Interval.ofBounds(0, 1));
            }
            return false;
        },
        setUpdateState: (state: VisualUpdateState, newProps: PD.Values<ArbitrarySphereParams>, currentProps: PD.Values<ArbitrarySphereParams>) => {
            state.createGeometry = (
                newProps.x !== currentProps.x ||
                newProps.y !== currentProps.y ||
                newProps.z !== currentProps.z ||
                newProps.radius !== currentProps.radius ||
                newProps.label !== currentProps.label ||
                newProps.selectable !== currentProps.selectable
            );
        }
    }, materialId);
}

export type ArbitrarySphereRepresentation = StructureRepresentation<ArbitrarySphereParams>;

export function ConfalPyramidsRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, ArbitrarySphereParams>): ArbitrarySphereRepresentation {
    const repr = Representation.createMulti('Confal Pyramids', ctx, getParams, StructureRepresentationStateBuilder, ArbitrarySphereVisuals as unknown as Representation.Def<Structure, ArbitrarySphereParams>);
    return repr;
}

export const ArbitrarySphereRepresentationProvider = StructureRepresentationProvider({
    name: 'arbitrary-sphere',
    label: 'Arbitrary sphere',
    description: 'Displays an arbitrary sphere at given coordinates with custom label',
    factory: ConfalPyramidsRepresentation,
    getParams: (ctx: ThemeRegistryContext, structure: Structure) => PD.clone(ArbitrarySphereParams),
    defaultValues: PD.getDefaultValues(ArbitrarySphereParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure: Structure) => true,
});

function createArbitrarySphereMesh(ctx: VisualContext, unit: Unit, structure: Structure, theme: Theme, props: PD.Values<ArbitrarySphereParams>, mesh?: Mesh) {
    const mb = MeshBuilder.createState(16, 16, mesh);
    mb.currentGroup = 0;
    const position = Vec3();
    position[0] = props.x;
    position[1] = props.y;
    position[2] = props.z;
    addSphere(mb, position, props.radius, 2);
    return MeshBuilder.getMesh(mb);
}
