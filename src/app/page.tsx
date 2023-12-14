import Image from 'next/image'
import Link from 'next/link'
import Home from './home/page'
import StructurePage from './[rcsb_id]/page'
import { useEffect, useRef } from 'react';
// import { InstantiateMolstarWrapper } from '@/molstar/mstar_wrapper';



export default function Root() {
  return <StructurePage />
}
