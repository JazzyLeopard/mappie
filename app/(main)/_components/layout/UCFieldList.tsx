import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MoreHorizontal, Trash, Plus, FileIcon, PresentationIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface UseCaseListProps {
    useCases: any[];
    activeUseCase: string | null;
    setActiveUseCase: (id: string) => void;
    onDelete: (id: Id<"useCases">) => void;
    onAddUseCase: () => Promise<void>;
    handleGenerateUseCases: () => Promise<void>;
    handlePresentationMode: () => void;
    isGenerating: boolean;
}

const UseCaseList = ({
    useCases,
    activeUseCase,
    setActiveUseCase,
    onDelete,
    onAddUseCase,
    handleGenerateUseCases,
    handlePresentationMode,
    isGenerating
}: UseCaseListProps) => {
    const deleteUseCase = useMutation(api.useCases.deleteUseCase);

    const handleDelete = async (id: Id<"useCases">) => {
        try {
            await deleteUseCase({ id });
            onDelete(id); // Call the onDelete prop to update local state
            toast.success("Use case deleted successfully");
        } catch (error) {
            console.error("Error deleting use case:", error);
            toast.error("Failed to delete use case");
        }
    };

    return (
        <aside className="w-64 pr-8 pt-8 h-full border-r">
            <div className="mb-4 text-lg font-semibold">Use Cases</div>
            <ul className="space-y-2">
                {useCases.map((useCase) => (
                    <li
                        key={useCase._id}
                        className={`flex items-center p-4 rounded-md ${
                            activeUseCase === useCase._id ? "bg-gray-100" : ""
                        }`}
                    >
                        <FileIcon className="w-4 h-4 mr-2" />
                        <Link
                            href="#"
                            className="truncate flex-grow"
                            onClick={() => setActiveUseCase(useCase._id)}
                            prefetch={false}
                        >
                            {useCase.title}
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleDelete(useCase._id)}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                ))}
            </ul>
            <div className="mt-4 space-y-2">
                <Button 
                    className="w-full h-10" 
                    variant="default" 
                    onClick={handleGenerateUseCases}
                    disabled={isGenerating}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate use case"}
                </Button>
                <Button className="w-full h-10" variant="outline" onClick={onAddUseCase}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add a use case
                </Button>
            </div>
            <div className="mt-4">
                <Button className="w-full h-10" variant="ghost" onClick={handlePresentationMode}>
                    <PresentationIcon className="w-4 h-4 mr-2" />
                    Presentation Mode
                </Button>
            </div>
        </aside>
    );
};

export default UseCaseList;