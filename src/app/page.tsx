import Image from 'next/image'
import Link from 'next/link'
import Home from './home/page'
import StructurePage from './[rcsb_id]/page'
import { useEffect, useRef } from 'react';
import { InstantiateMolstarWrapper } from '@/molstar/mstar_wrapper';



export default function Root() {
  
  const molstarNodeRef = useRef(null);

  // useEffect(()=>{

  //   return () => {
  //     window.molstar?.dispose();
  //     window.molstar = undefined;
  //   };
  // },[])



  return <StructurePage/>
}
