import {createSlice} from '@reduxjs/toolkit'

export const CounterSlice =  createSlice({
    name:'counter',
    initialState : {value:0},
    reducers:{
        increment:(state)=>{
            return { value:state.value + 1 }
        },
        decrement:(state)=>{
            return { value:state.value - 1 }
        },
        incrementByAmount:(state,action)=>{
            return { value:state.value + action.payload }
        }
    }
})


export const {increment,decrement,incrementByAmount} = CounterSlice.actions
export default CounterSlice.reducer