import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"

export default function ChainPicker() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover me</Button>
      </HoverCardTrigger>



      <HoverCardContent className="w-80 p-4">
        <div className="grid gap-2">
          <div className="border rounded-lg p-1 max-h-[500px] overflow-y-auto scrollbar-hide">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer px-1 text-xs">3j7z</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-48" side="right">
                <div className="grid gap-1">
                  <div className="border rounded-sm p-0.5 px-2 text-xs">A1</div>
                  <div className="border rounded-sm p-0.5 px-2 text-xs">BF</div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="border rounded-lg p-2 max-h-[500px] overflow-y-auto scrollbar-hide">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer px-1 text-xs">5afi</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-48" side="right">
                <div className="grid gap-2">
                  <div className="border rounded-lg p-1 text-xs">IK</div>
                  <div className="border rounded-lg p-1 text-xs">J4</div>
                  <div className="border rounded-lg p-1 text-xs">KL</div>
                  <div className="border rounded-lg p-1 text-xs">LM</div>
                  <div className="border rounded-lg p-1 text-xs">MN</div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

        </div>
      </HoverCardContent>
    </HoverCard>
  )
}