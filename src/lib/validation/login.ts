import z from "zod";

export const loginFormValidator = z.object({
  email: z.string().describe("Email").email({ message: "Invalid Email" }),
  password: z
    .string()
    .describe("Password")
    .min(1, { message: "Password is required" }),
});

export type loginFormPayload = z.infer<typeof loginFormValidator>;
