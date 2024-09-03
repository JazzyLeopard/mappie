import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MoreHorizontal, Trash, Plus } from "lucide-react";
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
}

const UseCaseList = ({ useCases, activeUseCase, setActiveUseCase, onDelete, onAddUseCase }: UseCaseListProps) => {
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
        <div className="w-full bg-secondary p-4 rounded-md self-start h-auto overflow-y-auto flex flex-col">
            <nav className="space-y-2 flex-grow">
                {useCases.map((useCase) => (
                    <div key={useCase._id} className={`flex items-center text-sm justify-between p-1 px-2 rounded-md flex-grow ${activeUseCase === useCase._id ? "font-semibold bg-white text-black-500" : "hover:bg-gray-200"}`}>
                        <Link
                            href="#"
                            className="w-full"
                            onClick={() => setActiveUseCase(useCase._id)}
                            prefetch={false}
                        >
                            {useCase.title}
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="p-2 hover:bg-gray-200 rounded-md">
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleDelete(useCase._id)}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </nav>
            <Button 
                onClick={onAddUseCase} 
                className="mt-4 w-full bg-slate-400 hover:bg-slate-600 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Use Case
            </Button>
        </div>
    );
};

export default UseCaseList;