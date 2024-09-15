// EditorList.tsx
import { MenuItemType } from "@/lib/types";
import { toTitleCase } from "@/utils/helper";
import BlockEditor from "../BlockEditor";

interface EditorListProps {
    data: any
    components: MenuItemType[];
    handleEditorChange: (attribute: string, value: any) => void
    onEditorBlur: () => Promise<void>;
    onOpenBrainstormChat: () => void;
}

const EditorList = ({ data, components, handleEditorChange, onOpenBrainstormChat, onEditorBlur }: EditorListProps) => {

    return (
        <div className="h-full flex flex-col overflow-hidden mb-2">
            {components.map(c => (
                <div key={c.key} id={c.key} className="h-full flex flex-col overflow-hidden">
                    <h1 className="text-slate-900 pl-0 text-2xl font-semibold sticky top-0 bg-white z-10">
                        {toTitleCase(c.key)}
                    </h1>
                    <div className="flex-1 overflow-auto mt-2">
                        <BlockEditor
                            attribute={c.key}
                            projectDetails={data}
                            setProjectDetails={(value) => {
                                console.log('EditorList: Calling handleEditorChange', { key: c.key, value });
                                handleEditorChange(c.key, value);
                            }}
                            onOpenBrainstormChat={onOpenBrainstormChat}
                            onBlur={onEditorBlur}
                            context="project"
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EditorList