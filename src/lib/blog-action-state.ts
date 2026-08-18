export type BlogActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialBlogActionState: BlogActionState = {
  status: "idle",
  message: "",
};
