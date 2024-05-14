



# Molstar Desirables 

- [x] highlight chain
- [x] select arbitrary residues across the structure
- [x] download chain object from server 
- [ ] create object
- [ ] create separate chain object
- [ ] superimpose 
- [ ] superimpose two chains
- [ ] density maps (from custom server)

--------------- Questions to the team

# Add

Clear difference between assemblies and assymetric units in PDB

# Molstar Notes

*MolScript Builder:
- Is there a spec?
- What is it matched against? mmcif, surely?
- Is there a spec?

*Loci (Location)

*Transform

*Trajectory

*Behaviour

*Tas

*StructureQuery

*Expressions

*Cell

Data Flow, Dependencies


* [ PluginStateTree |  PluginStateTransform ](https://github.com/molstar/molstar/tree/master/docs/state)
    - Relationship with `manager`s and state? Ex. download transform has same params as the manager version.




MMCIF manipulation
`mol-io`

```typescript
import { CifBlock, CifCategory, CifFrame } from "../../mol-io/reader/cif";
import { mmCIF_Schema } from "../../mol-io/reader/cif/schema/mmcif";
```

# UI Notes

- A guide to developing a custom PluginUIComponent


# Molstar Notes

MolScript Builder for expressions: core, topology and macromolecular properties logic. What is it matched against? mmcif, surely?


Expressions

look at molscript -- query-compilation


#--------------------------------

Residue id/hovers/selection
https://github.com/molstar/molstar/issues/888
https://github.com/molstar/molstar/issues/120
https://github.com/molstar/molstar/issues/168
