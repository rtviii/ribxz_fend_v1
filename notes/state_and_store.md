# Spec transfer

!! The API does not need to be typed twice!!!
    1. Django serves openapi spec (at least under `django-ninja` config) at `${host}/openapi.json`
    2. ( Generate the RTK API )[https://redux-toolkit.js.org/rtk-query/usage/code-generation#openapi]: src/store/ribxz_api.ts is updated via `npx @rtk-query/codegen-openapi openapi-config.ts`. ( openapi config is at `src/store/openapi-config.ts`)

# Redux RTK Toolkit <-> Django communication

- combining global state with server components
- look at `next/server` 
- "normalizing state" (basically unrolling nested objects into a flat-ter structure). Not a priority, but something to keep in mind when desigining the API
- selectors
- (?) thunk middleware

# Perfomrance Gotchas

- memoization 
( memoize at lowest level via output selectors )[https://redux.js.org/usage/deriving-data-selectors#writing-memoized-selectors-with-reselect]

for api requests, use trifect asyncthunks : https://redux.js.org/usage/writing-logic-thunks#using-createasyncthunk


rtk-query/no thunks : https://redux.js.org/usage/writing-logic-thunks#fetching-data-with-rtk-query

- should we or should we not use `next-redux-wrapper`?????

- how to type rtk query responses

# Pagination

# Alignment

# Chain Picker


