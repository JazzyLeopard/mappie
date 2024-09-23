import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Component() {
    return (
        <div className="max-w-sm space-y-3 pr-2 mt-4">
            <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">Context</h2>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            Add documents to provide more context for the AI when generating content for any section.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="rounded-lg border border-dashed border-primary p-3 text-center">
                <div className="space-y-1">
                    <CloudUploadIcon className="mx-auto h-5 w-5 text-primary" />
                    <h3 className="text-xs font-medium">Upload files</h3>
                    <p className="text-xs text-muted-foreground">
                        Drag & drop or <button type="button" className="font-medium underline underline-offset-2">browse</button>
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, Word (.doc, .docx)</p>
                </div>
            </div>
            <div className="space-y-2">
                <FileItem filename="example.pdf" filesize="2.3 MB" />
                <FileItem filename="document.docx" filesize="1.7 MB" />
            </div>
        </div>
    )
}

function FileItem({ filename, filesize }: { filename: string, filesize: string }) {
    return (
        <div className="flex items-center justify-between rounded-md border bg-background p-1.5 text-xs">
            <div className="flex items-center gap-1.5">
                <FileIcon className="h-3 w-3 text-primary" />
                <div>
                    <p className="font-medium">{filename}</p>
                    <p className="text-xxs text-muted-foreground">{filesize}</p>
                </div>
            </div>
            <button type="button" className="text-muted-foreground hover:text-destructive">
                <XIcon className="h-3 w-3" />
            </button>
        </div>
    )
}

function CloudUploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
    )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}