import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface UseCaseListProps {
    useCases: any[];
    activeUseCase: string | null;
    setActiveUseCase: (id: string) => void;
    onDelete: (id: Id<"useCases">) => void;
}

const UseCaseList = ({ useCases, activeUseCase, setActiveUseCase, onDelete }: UseCaseListProps) => {
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
        <div className="w-full bg-secondary p-4 rounded-md self-start h-auto overflow-y-auto">
            <nav className="space-y-2">
                {useCases.map((useCase) => (
                    <div key={useCase._id} className={`flex items-center justify-between p-2 rounded-md flex-grow ${activeUseCase === useCase._id ? "font-semibold bg-white text-black-500" : "hover:bg-gray-200"}`}>
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
        </div>
    );
};

export default UseCaseList;