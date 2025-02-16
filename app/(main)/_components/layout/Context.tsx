import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useMutation, useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import Dropzone from "react-dropzone";
import { toast } from 'sonner';

interface ContextProps {
    projectId: Id<"projects">
}

export default function Component({ projectId }: ContextProps) {

    const { getToken } = useAuth();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const documents = useQuery(api.documents.getDocuments, { projectId })
    const [documentId, setDocumentId] = useState<Id<"documents"> | undefined>(undefined)

    const deleteFile = useMutation(api.documents.deleteDocument)

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

                const summarizedRes = await axios.post('/api/generate/summary', {
                    projectId,
                    storageId,
                    filename: file.name,
                    size: file.size
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                // Check if the API response is successful
                if (summarizedRes.status === 200) {
                    console.log("API Response: ", summarizedRes.data);

                    toast.success("File uploaded successfully")
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

    const handleDeleteFile = (documentId: Id<"documents"> | undefined) => {
        setIsConfirmModalOpen(true)
        setDocumentId(documentId)
    };

    const confirmDelete = async (documentId: Id<"documents"> | undefined) => {
        if (!documentId) {
            console.error("Document ID is undefined");
            toast.error("Failed to delete: Document ID is undefined");
            return;
        }

        setIsConfirmModalOpen(false);
        try {
            await deleteFile({ documentId });
            toast.success("File deleted successfully");
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete file");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-sm space-y-3 pr-2 mt-4">
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
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="pb-2">Delete File</DialogTitle>
                        <DialogDescription className="pb-2">
                            Are you sure you want to delete the uploaded file?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => confirmDelete(documentId)}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="space-y-2">
                {documents && documents.length > 0 &&
                    documents?.map((document: any) => (
                        <FileItem
                            key={document._id}
                            filename={document.filename}
                            filesize={document.size ? formatFileSize(document.size) : undefined}
                            onDelete={() => handleDeleteFile(document._id)}
                            fileUrl={document.url}
                        />
                    ))
                }
            </div>
        </div>
    )
}

function FileItem({ filename, filesize, onDelete, fileUrl }: { filename: string, filesize: string | undefined, onDelete: () => void, fileUrl: string }) {
    const handleDownload = () => {
        try {
            window.open(fileUrl, '_blank');
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
        }
    };

    return (
        <div
            className="flex items-center justify-between rounded-md border bg-background p-1.5 text-xs hover:bg-gray-100 cursor-pointer"
            onClick={handleDownload}
        >
            <div className="flex items-center gap-4">
                <FileIcon className="h-4 w-4 ml-1 text-primary" />
                <div>
                    <p className="font-medium">{filename}</p>
                    <p className="text-xs text-muted-foreground">{filesize}</p>
                </div>
            </div>
            <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent download on delete click
                    onDelete();
                }}
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