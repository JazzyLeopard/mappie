import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

type WorkspaceStore = {
  workspace: { id: Id<"workspaces"> } | null;
  setWorkspace: (workspace: { id: Id<"workspaces"> } | null) => void;
};

export const useWorkspace = create<WorkspaceStore>((set) => ({
  workspace: null,
  setWorkspace: (workspace) => set({ workspace }),
})); 