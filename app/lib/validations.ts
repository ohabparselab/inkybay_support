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
    currentPassword: z.string().min(1, "Current password is required."),
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
    clientQuery: z.string().min(1, "Client query is required."),
    handleBy: z.string().min(1, "Please select handle by"),
    chatDate: z.date().optional(),
    clientEmails: z.array(z.string().email("Invalid email")).optional(),
    chatTranscript: z.any().optional(),
    reviewAsked: z.boolean().optional(),
    reviewStatus: z.boolean().optional(),
    reviewText: z.string().optional(),
    lastReviewApproach: z.date().optional(),
    clientFeedback: z.string().optional(),
    storeDetails: z.string().optional(),
    featureRequest: z.string().optional(),
    agentRating: z.number().min(0).max(10).optional(),
    agentComments: z.string().optional(),
    otherStoresUrl: z.string().optional(),
});

export const addTaskSchema = z.object({
    clientId: z.number().optional(),
    taskDetails: z.string().min(1, "Task details is required."),
    providedBy: z.string().min(1, "Please select handle by"),
    taskStatus: z.string().optional(),
    storePassword: z.string().optional(),
    storeAccess: z.string().optional(),
    emails: z.array(z.string().email("Invalid email")).optional(),
    taskAddedDate: z.date().optional(),
    solvedBy: z.string().min(1, "Please select handle by"),
    reply: z.string().optional(),
    comments: z.string().optional()
});

export const createStatusSchema = z.object({
    name: z.string().min(1, "Status filed is required."),
})

export const addMeetingSchema = z.object({
    storeUrl: z.string().min(1, "Store URL is required"),
    isExternalMeeting: z.boolean().optional(),
    meetingDetails: z.string().min(1, "Meeting details is required"),
    agentId: z.string().min(1, "Please select agent."),
    meetingDateTime: z.date().optional(),
    reviewAsked: z.boolean(),
    reviewGiven: z.boolean(),
    reviewDate: z.date().optional(),
    reviewsInfo: z.string().optional(),
    emails: z.array(z.string().email("Invalid email")).optional(),
    joiningStatus: z.boolean(),
    recordedVideo: z
        .any()
        .refine((file) => file instanceof File || file === undefined, {
            message: "Recorded video must be a file",
        })
        .optional(),
    meetingNotes: z.string().optional(),
});

export const addMarketingFunnelSchema = z.object({
    clientId: z.number().optional(),
    installPhase: z.enum(["install", "uninstall"]),
    emails: z.array(z.string().email("Invalid email")),
    typeOfProducts: z.string().min(1, "Type of products field is required."),
    otherAppsInstalled: z.string().optional(),
    customizationType: z.string().optional(),
    initialFeedback: z.string().optional(),
    followUps: z.array(z.date()).optional(),
    clientSuccessStatus: z.enum(["yes", "no"]),
});

export type AddMarketingFunnelInput = z.infer<typeof addMarketingFunnelSchema>;
export type AddMeetingInput = z.infer<typeof addMeetingSchema>;
export type AddStatusInput = z.infer<typeof createStatusSchema>;
export type AddTaskFormInput = z.infer<typeof addTaskSchema>;
export type AddChatFormInput = z.infer<typeof addChatSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;