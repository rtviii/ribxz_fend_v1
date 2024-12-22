// import { Loci } from "molstar/lib/mol-model/loci";
// import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
// import { Asset } from "molstar/lib/mol-util/assets";

// export const renderPTC = async (ctx: PluginUIContext, rcsb_id: string) => {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/ptc?rcsb_id=${rcsb_id}`
//   );
//   const data = await response.json();
//   let [x, y, z] = data["midpoint_coordinates"];
//   let sphere = { x: x, y: y, z: z, radius: 5, color: "blue" };

//   const structureRef =
//     ctx.managers.structure.hierarchy.current.structures[0]?.cell.transform.ref;
//   ctx.builders.structure.representation.addRepresentation(structureRef, {
//     type: "arbitrary-sphere" as any,
//     typeParams: sphere,
//     colorParams: sphere.color ? { value: sphere.color } : void 0,
//   });
// };

// export const tunnel_geoemetry = async (
//   ctx: PluginUIContext,
//   rcsb_id: string
// ): Promise<Loci> => {
//   const provider = ctx.dataFormats.get("ply")!;
//   const myurl = `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`;
//   const data = await ctx.builders.data.download({
//     url: Asset.Url(myurl.toString()),
//     isBinary: false,
//   });
//   const parsed = await provider!.parse(ctx, data!);

//   if (provider.visuals) {
//     const visual = await provider.visuals!(ctx, parsed);
//     const shape_ref = visual.ref;
//     const meshObject = ctx.state.data.select(shape_ref)[0];
//     const shape_loci = await meshObject.obj.data.repr.getAllLoci();
//     return shape_loci;
//   } else {
//     throw Error("provider.visuals is undefined for this `ply` data format");
//   }
// };





