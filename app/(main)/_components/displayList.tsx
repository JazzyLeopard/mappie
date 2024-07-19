// DisplayList.tsx
import { CKEditor } from "@ckeditor/ckeditor5-react";
import InlineEditor from "@ckeditor/ckeditor5-build-inline";
import { toTitleCase } from "@/utils/helper"
import { MenuItemType } from "@/lib/types";

interface DisplayListProps {
    data: any
    components: MenuItemType[];
    onEditorBlur: () => Promise<void>;
    handleEditorChange: (event: any, editor: InlineEditor, attribute: string) => void
}

const DisplayList = ({ data, components, onEditorBlur, handleEditorChange }: DisplayListProps) => {
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
                                <CKEditor
                                    editor={InlineEditor}
                                    data={data[c.key]}
                                    onBlur={onEditorBlur}
                                    onChange={(event, editor) => handleEditorChange(event, editor, c.key)}
                                    config={{
                                        placeholder: c.description,
                                        toolbar: [
                                            "bold",
                                            "italic",
                                            "link",
                                            "bulletedList",
                                            "numberedList",
                                        ],
                                        removePlugins: [
                                            "BalloonToolbar",
                                            "BalloonToolbarUI",
                                            "EasyImage",
                                            "CKFinder",
                                        ],
                                        ui: {
                                            viewportOffset: { top: 0, right: 0, bottom: 0, left: 0 }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}

export default DisplayList
