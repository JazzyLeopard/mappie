// EditorList.tsx
import { toTitleCase } from "@/utils/helper"
import { MenuItemType } from "@/lib/types";
import BlockEditor from "../BlockEditor";
import { propertyPrompts } from "../constants";

interface EditorListProps {
    data: any
    components: MenuItemType[];
    handleEditorChange: (attribute: string, value: any) => void
    onOpenBrainstormChat: () => void;
}

const EditorList = ({ data, components, handleEditorChange, onOpenBrainstormChat }: EditorListProps) => {

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {components.map(c => {
                if (c.active) {
                    return (
                        <div key={c.key} id={c.key} className="h-full flex flex-col overflow-hidden">
                            <h1 className="text-slate-900 pl-2 text-2xl font-semibold sticky top-0 bg-white z-10">
                                {toTitleCase(c.key)}
                            </h1>
                            <div className="flex-1 overflow-hidden">
                                <BlockEditor
                                    attribute={c.key}
                                    projectDetails={data}
                                    setProjectDetails={(value) => handleEditorChange(c.key, value)}
                                    onOpenBrainstormChat={onOpenBrainstormChat}
                                    onBlur={async () => {}} // Changed to async function
                                />
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default EditorList