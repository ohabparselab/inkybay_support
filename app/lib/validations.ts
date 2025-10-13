import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid email address",
            });
        }
    }),

    password: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password is required",
            });
        } else if (val.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters",
            });
        }
    }),
});


export const createUserSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid email address",
            });
        }
    }),

    password: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password is required",
            });
        } else if (val.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters",
            });
        }
    }),
    role: z.string(),
    permissions: z.record(z.string(), z.array(z.number())).optional(),
})

export const updateUserSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid email address",
            });
        }
    }),

    password: z
        .string()
        .optional()
        .superRefine((val, ctx) => {
            if (val && val.length < 6) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Password must be at least 6 characters",
                });
            }
        }),
    role: z.string(),
    permissions: z.record(z.string(), z.array(z.number())).optional(),
})

export const updateProfileSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().superRefine((val, ctx) => {
        if (!val || val.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
            });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid email address",
            });
        }
    }),
    avatar: z
        .any()
        .optional()
        .refine((fileList) => {
            if (!fileList) return true; // optional
            const file = fileList[0];
            return file instanceof File;
        }, "Invalid file")
        .refine((fileList) => {
            if (!fileList) return true; // optional
            const file = fileList[0];
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            return allowedTypes.includes(file.type);
        }, "Only JPG, PNG, or WEBP images are allowed")
        .refine((fileList) => {
            if (!fileList) return true; // optional
            const file = fileList[0];
            const maxSizeInMB = 2;
            return file.size / 1024 / 1024 <= maxSizeInMB;
        }, "Max file size is 2MB"),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
}).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
            path: ["confirmPassword"],
            code: z.ZodIssueCode.custom,
            message: "Confirm password do not match",
        });
    }
});

export const addChatSchema = z.object({
    clientQuery: z.string().min(1, "Client query is required"),
    handleBy: z.string().optional(),
    chatDate: z.date().optional(),
    clientEmails: z.array(z.string().email("Invalid email")).optional(),
    chatTranscript: z.any().optional(),
    reviewAsked: z.boolean().optional(),
    reviewStatus: z.boolean().optional(),
    reviewText: z.string().optional(),
    reviewDate: z.date().optional(),
    lastReviewApproach: z.date().optional(),
    clientFeedback: z.string().optional(),
    storeDetails: z.string().optional(),
    featureRequest: z.string().optional(),
    agentRating: z.number().min(0).max(10).optional(),
    agentComments: z.string().optional(),
    otherStoresUrl: z.string().optional(),
});

export type AddChatFormInput = z.infer<typeof addChatSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;