'use client';
import {createContext, useState} from 'react';
import {ribxzMstarv2} from './mstar_v2';

export const MolstarContext = createContext<null | ribxzMstarv2>(null);
export default function MolstarContextProvider({
    children,
    value
}: {
    children: React.ReactNode;
    value: null | ribxzMstarv2;
}) {
    return <MolstarContext.Provider value={value}>{children}</MolstarContext.Provider>;
}
