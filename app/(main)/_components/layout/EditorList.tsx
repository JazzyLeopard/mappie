// EditorList.tsx
import { toTitleCase } from "@/utils/helper"
import { MenuItemType } from "@/lib/types";
import BlockEditor from "../BlockEditor";

interface EditorListProps {
    data: any
    components: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (attribute: string, value: any) => void
}

const EditorList = ({ data, components, onEditorBlur, handleEditorChange }: EditorListProps) => {
    return (
        <div className=" flex-row space-y-4 w-full justify-between pb-[420px]">
            {components.map(c => {
                if (c.active) {

                    return (
                        <div key={c.key} id={c.key} className="border rounded-lg scroll-mt-[140px] p-3 min-h-[600px]">
                            <h1 className="text-slate-900 pl-2 text-2xl font-semibold leading-[44.16px]">
                                {toTitleCase(c.key)}
                            </h1>

                            <div className="prose max-w-none">
                                <BlockEditor
                                    onBlur={onEditorBlur}
                                    attribute={c.key}
                                    projectDetails={data}
                                    setProjectDetails={(value) => handleEditorChange(c.key, value)}
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
