export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialContactActionState: ContactActionState = {
  status: "idle",
  message: "",
};
