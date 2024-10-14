import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useMutation, useQuery } from 'convex/react';
import { InfoIcon, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import Dropzone from "react-dropzone";
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface ContextProps {
    projectId: Id<"projects">
}

export default function Component({ projectId }: ContextProps) {

    const { getToken } = useAuth();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string, size: number }[]>([])
    const generateUploadUrl = useMutation(api.documents.generateUploadUrl);

    const referenceDocs = useQuery(api.documents.getDocuments, { projectId: projectId })
    console.log("Reference Docs", referenceDocs);


    const onDropRejected = () => { }

    const onDropAccepted = async (acceptedFiles: File[]) => {
        setIsUploading(true)
        setUploadProgress(0);

        acceptedFiles.forEach(async (file) => {
            // Create a new FormData object to hold the file
            const formData = new FormData();
            formData.append('file', file);
            console.log(file)


            try {
                const token = await getToken({ template: "convex" });

                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file!.type },
                    body: file,
                });
                const { storageId } = await result.json();
                console.log("result", result)

                setUploadProgress(45)

                const summarizedRes = await axios.post('/api/generate/summary', { projectId, storageId, filename: file.name }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                // Check if the API response is successful
                if (summarizedRes.status === 200) {
                    console.log("API Response: ", summarizedRes.data);

                    toast.success("File uploaded successfully")

                    // Update the uploaded files state
                    setUploadedFiles(prevFiles => [...prevFiles, { name: file.name, size: file.size }]);
                } else {
                    toast.error("File upload failed: " + summarizedRes?.data?.message || "Unknown error");
                }
            } catch (error) {
                console.error("Error uploading file: ", error);
                toast.error("File upload failed");
            } finally {
                setIsUploading(false);
            }
        });
    };

    const handleDeleteFile = (filename: string) => {
        setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== filename));
        toast.success("File has been deleted")
    };

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
            <div className="rounded-lg cursor-pointer border border-dashed border-primary p-3 text-center">
                <Dropzone
                    onDropRejected={onDropRejected}
                    onDropAccepted={onDropAccepted}
                    accept={{
                        "public/pdf": [".pdf"],
                        "public/doc": [".doc"],
                        "public/docx": [".docx"],
                    }}
                >
                    {({ getRootProps, getInputProps }) => (
                        <div
                            className='h-full w-full flex-1 flex-col items-center justify-center'
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />

                            {isUploading && (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
                                    <p className='text-xs font-medium'>Uploading...</p>
                                    <Progress value={uploadProgress} className='w-40 mt-2 h-2 bg-gray-300 ' />
                                </div>
                            )}

                            {!isUploading && (
                                <div className="space-y-1">
                                    <CloudUploadIcon className="mx-auto h-5 w-5 text-primary" />
                                    <h3 className="text-xs font-medium">Upload files</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Drag & drop or <button type="button" className="font-medium underline underline-offset-2">browse</button>
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF, Word (.doc, .docx)</p>
                                </div>
                            )}
                        </div>
                    )}
                </Dropzone>
            </div>
            <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                    <FileItem
                        key={index}
                        filename={file.name}
                        filesize={(file.size / (1024 * 1024)).toFixed(2) + " MB"}
                        onDelete={handleDeleteFile}
                    />
                ))}
            </div>
        </div>
    )
}

function FileItem({ filename, filesize, onDelete }: { filename: string, filesize: string, onDelete: (filename: string) => void }) {
    return (
        <div className="flex items-center justify-between rounded-md border bg-background p-1.5 text-xs">
            <div className="flex items-center gap-1.5">
                <FileIcon className="h-3 w-3 text-primary" />
                <div>
                    <p className="font-medium">{filename}</p>
                    <p className="text-xxs text-muted-foreground">{filesize}</p>
                </div>
            </div>
            <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(filename)} // Call the delete function on click
            >
                <XIcon className="h-3 w-3" />
            </button>
        </div>
    );
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