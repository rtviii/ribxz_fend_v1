
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export const AuthorsHovercard = ({ authors }: { authors: string[] }) => {
    return <HoverCard>
        <HoverCardTrigger asChild>
            <span className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md text-xs   transition-colors z-10" title="Full list of authors"  >
                <span style={{ fontStyle: "italic" }} >{authors[0]}</span>
                <span style={{
                    cursor: "pointer",
                    display: 'inline-block',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    backgroundColor: '#cccccc',
                    textAlign: 'center',
                    lineHeight: '15px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: 'white'
                }}>+</span>
            </span>
        </HoverCardTrigger>

        <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
            {
                authors.map((author) => {
                    return <div key={author} className="flex items-center gap-2">
                        <div>
                            <div className="font-medium">{author}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Co-Author</div>
                        </div>
                    </div>
                })}
        </HoverCardContent>
    </HoverCard>
}