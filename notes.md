
# State management issues that might come up

- Nextjs/Redux <-> Backend interactions
- combining global state with server components
- look at `next/server` 


look at normalizing state. meh
selectors
thunk middleware

( memoize at lowest level via output selectors )[https://redux.js.org/usage/deriving-data-selectors#writing-memoized-selectors-with-reselect]

for api requests, use trifect asyncthunks : https://redux.js.org/usage/writing-logic-thunks#using-createasyncthunk

rtk-query/no thunks : https://redux.js.org/usage/writing-logic-thunks#fetching-data-with-rtk-query

- should we or should we not use `next-redux-wrapper`?????

- how to type rtk query responses

# UBC migration details

rtkushner1@r8-kdd.math.ubc.ca

# Molstar Development

* desirable features: highlight chain 
* you have a tailwind subscription

- [x] highlight chain
- [x] select arbitrary residues across the structure

- [x] download chain object from server 

- create object
- create separate chain object

- superimpose 
- superimpose two chains
- superimpose two structures
- density maps



# Molstar Notes

MolScript Builder for expressions: core, topology and macromolecular properties logic. What is it matched against? mmcif, surely?


Expressions

look at molscript -- query-compilation


#--------------------------------

Residue id/hovers/selection
https://github.com/molstar/molstar/issues/888
https://github.com/molstar/molstar/issues/120
https://github.com/molstar/molstar/issues/168

