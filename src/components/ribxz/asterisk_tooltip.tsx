'use client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const AsteriskTooltip = ({children, className}:{children:React.ReactNode, className?:string}) => {
    return <TooltipProvider>
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild >
                <abbr
                    className={ `ml-1  hover:cursor-pointer ${className} ` } 
                    style={{ textDecoration: "none" }}>
                    *
                </abbr>
            </TooltipTrigger>
            <TooltipContent>
                {children}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
}