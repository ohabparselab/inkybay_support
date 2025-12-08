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
    isActive: z.boolean(),
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
    isActive: z.boolean(),
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
    externalChat: z.boolean(),
    shopUrl: z.string().optional(),
    shopName: z.string().optional(),
    shopEmail: z.string().optional(),
    clientQuery: z.string().min(1, "Client query is required."),
    handledByUsers: z.array(z.string()).optional(),
    projectId: z.string().optional(),
    storefrontPassword: z.string().optional(),
    chatDate: z.date().optional(),
    clientEmails: z.array(z.string().email("Invalid email")).optional(),
    tags: z.array(z.string()).optional(),
    chatTranscript: z.any().optional(),
    reviewAsked: z.boolean().optional(),
    reviewNotAskReason: z.string().optional(),
    reviewSubmittedAt: z.date().optional(),
    reviewStatus: z.boolean().optional(),
    reviewText: z.string().optional(),
    rating: z.number().min(0).max(10).optional(),
    lastReviewApproach: z.date().optional(),
    reviewApproachByUsers: z.array(z.string()).optional(),
    clientFeedback: z.string().optional(),
    storeDetails: z.string().optional(),
    featureRequest: z.string().optional(),
    agentRating: z.number().min(0).max(10).optional(),
    ratingMood: z.string().optional(),
    otherStoresUrl: z.string().optional(),
    changesMadeByAgent: z.string().optional(),
    comments: z.string().optional(),
    mentions: z.array(z.number().optional()).optional(),
});

export const addTaskSchema = z.object({
    clientId: z.number().optional(),
    taskDetails: z.string().min(1, "Task details is required."),
    providedBy: z.string().min(1, "Please select provided by."),
    taskStatus: z.string().min(1, "Please select status."),
    storePassword: z.string().optional(),
    storeAccess: z.string().optional(),
    emails: z.array(z.string().email("Invalid email")).optional(),
    taskAddedDate: z.date().optional(),
    solvedBy: z.string().optional(),
    projectId: z.string({error: "Please select project."}),
    notes: z.string().optional(),
    comments: z.string().optional(),
    mentions: z.array(z.number().optional()).optional(),
});

export const createStatusSchema = z.object({
    name: z.string().min(1, "Status filed is required."),
})

export const addMeetingSchema = z.object({
    storeUrl: z.string().min(1, "Store URL is required"),
    isExternalMeeting: z.boolean().optional(),
    meetingDetails: z.string().min(1, "Meeting details is required"),
    agents: z.array(z.string()).optional(),
    projectId: z.string({error: "Please select project."}),
    meetingDateTime: z.date({ error: "Meeting date & time is required" }),
    reviewAsked: z.boolean(),
    reviewGiven: z.boolean(),
    reviewDate: z.date().optional(),
    reviewsInfo: z.string().optional(),
    emails: z.array(z.string().email("Invalid email")).optional(),
    joiningStatus: z.boolean(),
    recordedVideo: z.string().optional(),
    meetingNotes: z.string().optional(),
});

export const addMarketingFunnelSchema = z.object({
  clientId: z.number().optional(),
  funnelId: z.number().optional(),
  installPhase: z.string().optional(),
  emails: z.array(z.string().email("Invalid email")).optional(),
  typeOfProducts: z.string().min(1, "Type of products field is required."),
  customizationType: z.string().optional(),
  projectId: z.string().optional(),
  followUps: z
    .array(
      z.object({
        funnelId: z.string().optional(),
        installPhase: z.string(),
        followUpStep: z.string(),
        followUpDate: z.date({
          error: "Follow-up date is required.",
        }),
        clientSuccessStatus: z.enum(['yes', 'no'], {
          error: "Status is required.",
        }),
        initialFeedback: z.string().optional(),
        otherAppsInstalled: z.string().optional(),
        isNew: z.boolean(),
      })
    ).optional(),
});

export const addProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    slug: z.string().min(1, "Slug is required"),
});

// 🔹 Validation Schema
export const addPlatformSchema = z.object({
    projectId: z.number({ error: "Please select project." }),
    name: z.string().min(2, "Platform name is required"),
    slug: z.string().min(2, "Slug is required")
});

export const addReviewSchema = z.object({
    shopUrl: z.string().optional(),
    shopName: z.string().optional(),
    projectId: z.string().optional(),
    rating: z.number().optional(),
    reviewText: z.string().min(3, "Review text required"),
    reviewApproachByUsers: z.array(z.string()).optional(),
    lastReviewApproach: z.date().optional(),
    reviewSubmittedAt: z.date().optional(),
});

export const addFeatureRequestSchema = z.object({
    shopUrl: z.string().optional(),
    projectId: z.string().optional(),
    shopName: z.string().optional(),
    email:  z.string().or(z.string().email().optional()).optional(),
    featureDetails: z.string().min(1, "Feature Details are required"),
});

export const CollaborationSchema = z.object({
    appName: z.string().min(1, "App name is required"),
    appUrl: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    companyUrl: z.string().optional().nullable(),
    appDetails: z.string().optional().nullable(),
    emails: z.array(z.string().email()).optional().default([]),
    projectId: z.union([z.string(), z.number()]).optional().nullable(),
    appAddedDate: z.string().optional().nullable(),
    completedDate: z.string().optional().nullable(),
    collaborationAreas: z.array(z.number()).optional().default([]),
    statusId: z.union([z.string(), z.number()]).optional().nullable(),
    sendById: z.union([z.string(), z.number()]).optional().nullable(),
    comments: z.string().optional().nullable(),
    meetingDetails: z.string().optional().nullable(),
    requestType: z.string().optional().nullable(),
});

export const AddCollaborationSchema = z.object({
    appName: z.string().min(2, "App Name field is required."),
    appUrl: z.string().optional(),
    companyName: z.string().optional(),
    companyUrl: z.string().optional(),
    appDetails: z.string().optional(),
    emails: z.array(z.string().email("Invalid Email")).optional(),
    projectId: z.string().optional(),
    appAddedDate: z.date().optional(),
    completedDate: z.date().optional(),
    collaborationAreas: z.array(z.number()).optional(),
    statusId: z.string().optional(),
    sendById: z.string().optional(),
    comments: z.string().optional(),
    meetingDetails: z.string().optional(),
    requestType: z.string().optional(),
});

export const AddCommunitySchema = z.object({
    question: z.string().min(3, "Question field is required."),
    questionUrl: z.string().url("Please enter a valid hyperlink."),
    projectId: z.string().optional(),
    listedDate: z.date().optional(),
    addedById: z.string().optional(),
    reply: z.string().optional(),
    statusId: z.string().optional(),
    comments: z.string().optional(),
    mentions: z.array(z.number().optional()).optional(),
});

export const addCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required"),
    mentions: z.array(z.number()).optional(),
    parentId: z.number().optional(),
    chatId: z.number().optional(),
    taskId: z.number().optional(),
    communityId: z.number().optional(),
});

export type AddCommunityInput = z.infer<typeof AddCommunitySchema>;
export type AddCollaborationInput = z.infer<typeof AddCollaborationSchema>;
export type CollaborationInput = z.infer<typeof CollaborationSchema>;
export type AddFeatureRequestInput = z.infer<typeof addFeatureRequestSchema>;
export type AddReviewInput = z.infer<typeof addReviewSchema>;
export type AddPlatformForm = z.infer<typeof addPlatformSchema>;
export type AddProjectForm = z.infer<typeof addProjectSchema>;
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