import { addCylinder } from "molstar/lib/mol-geo/geometry/mesh/builder/cylinder";
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

const ArbitraryCylinderVisuals = {
    'arbitrary-cylinder': (ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, ArbitraryCylinderParams>) =>
        UnitsRepresentation('Arbitrary cylinder mesh', ctx, getParams, ArbitraryCylinderVisual),
};

// Parameters for controlling the cylinder's appearance
const ArbitraryCylinderParams = {
    ...UnitsMeshParams,
    startX: PD.Numeric(0),
    startY: PD.Numeric(0),
    startZ: PD.Numeric(0),
    endX: PD.Numeric(0),
    endY: PD.Numeric(0),
    endZ: PD.Numeric(0),
    radius: PD.Numeric(0.5),
};
type ArbitraryCylinderParams = typeof ArbitraryCylinderParams;

function ArbitraryCylinderVisual(materialId: number): UnitsVisual<ArbitraryCylinderParams> {
    return UnitsMeshVisual<ArbitraryCylinderParams>({
        defaultProps: PD.getDefaultValues(ArbitraryCylinderParams),
        createGeometry: createArbitraryCylinderMesh,
        createLocationIterator: (structureGroup: StructureGroup) => {
            return LocationIterator(1, structureGroup.group.units.length, 1, () => NullLocation)
        },
        getLoci: (pickingId: PickingId, structureGroup: StructureGroup, id: number) => {
            const { objectId } = pickingId;
            if (objectId !== id) return EmptyLoci;

            return DataLoci(
                'arbitrary-cylinder-data-loci',
                void 0,
                [0],
                void 0,
                () => "Cylinder"
            );
        },
        eachLocation: (loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean) => {
            if (loci.kind === 'data-loci' && loci.tag === 'arbitrary-cylinder-data-loci') {
                return apply(Interval.ofBounds(0, 1));
            }
            return false;
        },
        setUpdateState: (state: VisualUpdateState, newProps: PD.Values<ArbitraryCylinderParams>, currentProps: PD.Values<ArbitraryCylinderParams>) => {
            state.createGeometry = (
                newProps.startX !== currentProps.startX ||
                newProps.startY !== currentProps.startY ||
                newProps.startZ !== currentProps.startZ ||
                newProps.endX !== currentProps.endX ||
                newProps.endY !== currentProps.endY ||
                newProps.endZ !== currentProps.endZ ||
                newProps.radius !== currentProps.radius
            );
        }
    }, materialId);
}

export type ArbitraryCylinderRepresentation = StructureRepresentation<ArbitraryCylinderParams>;

function ArbitraryCylinderRepresentationFactory(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, ArbitraryCylinderParams>): ArbitraryCylinderRepresentation {
    const repr = Representation.createMulti('Arbitrary Cylinder', ctx, getParams, StructureRepresentationStateBuilder, ArbitraryCylinderVisuals as unknown as Representation.Def<Structure, ArbitraryCylinderParams>);
    return repr;
}

export const ArbitraryCylinderRepresentationProvider = StructureRepresentationProvider({
    name: 'arbitrary-cylinder',
    label: 'Arbitrary cylinder',
    description: 'Displays an arbitrary cylinder between two points',
    factory: ArbitraryCylinderRepresentationFactory,
    getParams: (ctx: ThemeRegistryContext, structure: Structure) => PD.clone(ArbitraryCylinderParams),
    defaultValues: PD.getDefaultValues(ArbitraryCylinderParams),
    defaultColorTheme: { name: 'uniform' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure: Structure) => true,
});



function createArbitraryCylinderMesh(ctx: VisualContext, unit: Unit, structure: Structure, theme: Theme, props: PD.Values<ArbitraryCylinderParams>, mesh?: Mesh) {
    const mb = MeshBuilder.createState(16, 16, mesh);
    mb.currentGroup = 0;

    const start = Vec3.create(props.startX, props.startY, props.startZ);
    const end   = Vec3.create(props.endX, props.endY, props.endZ);
    
    const cylinderProps = {
        radiusTop: props.radius,
        radiusBottom: props.radius,
        radialSegments: 32,
        heightSegments: 1,
        topCap: true,
        bottomCap: true,
        thetaStart: 0,
        thetaLength: 2 * Math.PI
    };

    addCylinder(mb, start, end, props.radius, cylinderProps);
    
    return MeshBuilder.getMesh(mb);
}
