export type ProjectActionState = {
  status: "idle" | "success" | "error";
  message: string;
  projectId?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialProjectActionState: ProjectActionState = { status: "idle", message: "" };

