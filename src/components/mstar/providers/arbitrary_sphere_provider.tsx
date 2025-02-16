import {UnitsVisual, UnitsMeshVisual, UnitsMeshParams} from 'molstar/lib/mol-repr/structure/units-visual';
import {Structure, Unit} from 'molstar/lib/mol-model/structure';
import {ParamDefinition as PD} from 'molstar/lib/mol-util/param-definition';
import {Representation, RepresentationContext, RepresentationParamsGetter} from 'molstar/lib/mol-repr/representation';
import {StructureRepresentationProvider} from 'molstar/lib/mol-repr/structure/representation';
import {Theme} from 'molstar/lib/mol-theme/theme';
import {MeshBuilder} from 'molstar/lib/mol-geo/geometry/mesh/mesh-builder';
import {addSphere} from 'molstar/lib/mol-geo/geometry/mesh/builder/sphere';
import {Mesh} from 'molstar/lib/mol-geo/geometry/mesh/mesh';
import {LocationIterator} from 'molstar/lib/mol-geo/util/location-iterator';
import {NullLocation} from 'molstar/lib/mol-model/location';
import {PickingId} from 'molstar/lib/mol-geo/geometry/picking';
import {DataLoci, EmptyLoci, Loci} from 'molstar/lib/mol-model/loci';
import {Interval} from 'molstar/lib/mol-data/int';
import {StructureGroup} from 'molstar/lib/mol-repr/structure/visual/util/common';
import {Visual, VisualContext} from 'molstar/lib/mol-repr/visual';
import {UnitsRepresentation} from 'molstar/lib/mol-repr/structure/representation';
import {Vec3} from 'molstar/lib/mol-math/linear-algebra/3d/vec3';

const ArbitrarySphereParams = {
    ...UnitsMeshParams,
    x: PD.Numeric(0),
    y: PD.Numeric(0),
    z: PD.Numeric(0),
    radius: PD.Numeric(2),
    label: PD.Text('Sphere')
};
type ArbitrarySphereParams = typeof ArbitrarySphereParams;

function ArbitrarySphereVisual(materialId: number): UnitsVisual<ArbitrarySphereParams> {
    // Capture current props at this scope
    let currentProps: PD.Values<ArbitrarySphereParams>;

    return UnitsMeshVisual<ArbitrarySphereParams>(
        {
            defaultProps: PD.getDefaultValues(ArbitrarySphereParams),

            createGeometry: (
                ctx: VisualContext,
                unit: Unit,
                structure: Structure,
                theme: Theme,
                props: PD.Values<ArbitrarySphereParams>,
                mesh?: Mesh
            ) => {
                // Store the props for use in other methods
                currentProps = props;

                const mb = MeshBuilder.createState(16, 16, mesh);
                mb.currentGroup = 0;

                const position = Vec3.create(props.x, props.y, props.z);
                addSphere(mb, position, props.radius, 2);
                return MeshBuilder.getMesh(mb);
            },

            createLocationIterator: (structureGroup: StructureGroup) => {
                return LocationIterator(1, 1, 1, () => NullLocation);
            },

            getLoci: (pickingId: PickingId, structureGroup: StructureGroup, id: number) => {
                if (pickingId.objectId !== id) return EmptyLoci;
                return DataLoci(
                    'arbitrary-sphere-loci',
                    {
                        center: Vec3.create(currentProps.x, currentProps.y, currentProps.z),
                        radius: currentProps.radius
                    },
                    [0],
                    undefined,
                    () => currentProps.label
                );
            },

            eachLocation: (loci: Loci, structureGroup: StructureGroup, apply: (interval: Interval) => boolean) => {
                if (loci.kind === 'data-loci' && loci.tag === 'arbitrary-sphere-loci') {
                    return apply(Interval.ofBounds(0, 1));
                }
                return false;
            },

            setUpdateState: (
                state: any,
                newProps: any,
                currentProps: any,
                newTheme: Theme,
                currentTheme: Theme,
                newStructureGroup: StructureGroup,
                currentStructureGroup: StructureGroup
            ) => {
                state.createGeometry =
                    newProps.x !== currentProps.x ||
                    newProps.y !== currentProps.y ||
                    newProps.z !== currentProps.z ||
                    newProps.radius !== currentProps.radius;
            }
        },
        materialId
    );
}

function ArbitrarySphereRepresentation(
    ctx: RepresentationContext,
    getParams: RepresentationParamsGetter<Structure, ArbitrarySphereParams>
) {
    return UnitsRepresentation('Arbitrary Sphere', ctx, getParams, (materialId: number) =>
        ArbitrarySphereVisual(materialId)
    );
}

export const ArbitrarySphereRepresentationProvider = StructureRepresentationProvider({
    name: 'arbitrary-sphere',
    label: 'Arbitrary Sphere',
    description: 'Displays a sphere at specified coordinates',
    factory: ArbitrarySphereRepresentation,
    getParams: () => ArbitrarySphereParams,
    defaultValues: PD.getDefaultValues(ArbitrarySphereParams),
    defaultColorTheme: {name: 'uniform'},
    defaultSizeTheme: {name: 'uniform'},
    isApplicable: () => true
});
