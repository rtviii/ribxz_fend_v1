// "use client"
import { useDispatch, useSelector } from 'react-redux';
import{setCounter} from '../state/counter/counter'
import{setStructureData,setStructureError, setStructureLoading, StructState } from '../state/structure/structure'
import { useEffect } from 'react';


interface CounterState {
  counter: number
}

console.log("setUserData", setCounter);

export default function Home() {

  const dispatch     = useDispatch();
  const counterState = useSelector((state: { counter: CounterState }) => state.counter);
  const structState  = useSelector((state: { struct: StructState }) => state.struct);

  useEffect(() => {
    async function fetchStructData() {
      try {
        dispatch(setStructureLoading(true));
        const response = await fetch(`localhost:8000/v0/get_struct/?pdbid=3j7z`, {cache: "default"})
        dispatch(setStructureData(response.json()));
        dispatch(setStructureLoading(false));
      } catch (error: any) {
        dispatch(setStructureLoading(error.message));
        dispatch(setStructureLoading(false));
      }
    }

    fetchStructData();
  }, [dispatch]);

  const counter = 0
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>struct id:{structState.data.pdbid}</div>
      <div>struct authors:{structState.data.authors}</div>
      <div>struct title:{structState.data.title}</div>

      <button onClick={()=>{ alert("incremented") }}>increment counter</button>
     counter :{counterState.counter}
    </main>
  )
}

