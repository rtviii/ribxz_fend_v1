import { useEffect, useState } from "react";

export const ExpMethodBadge = ({ expMethod, resolution, className }: { expMethod: string | undefined , resolution:number|string, className?:string}) => {
    const [method, setMethod] = useState<string | undefined>(undefined)
    const [methodColor, setMethodColor] = useState<string | undefined>(undefined)
    useEffect(() => {
        if (expMethod === undefined) { return }
        if (expMethod.toLowerCase().includes("electron")) {
            setMethod("EM")
            setMethodColor("text-cyan-500")
        } else if (expMethod.toLowerCase().includes("ray")) {
            setMethod("XRAY")
            setMethodColor("text-orange-500")
        } else if (expMethod.toLowerCase().includes("nmr")) {
            setMethod("NMR")
            setMethodColor("text-green-500")
        }
    }, [expMethod])
    return expMethod === undefined ? null : <div className={`${className === null ? "" :className } text-center bg-muted border rounded-sm  px-3 py-1 text-xs ${methodColor} `} > {method} {resolution}Å </div>
}
