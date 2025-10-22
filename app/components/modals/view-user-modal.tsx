import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "../ui/button";

interface UserInfoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void;
    user: any | null
}

export function UserInfoModal({ open, onOpenChange, user }: UserInfoModalProps) {

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader className="pb-5 border-b">
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

                <div className="flex justify-center">
                    <img
                        src={user.avatar || "/avatar-default.svg"}
                        alt={user.fullName}
                        className="w-1/4 h-auto rounded-full border-4 border-background shadow-lg object-cover"
                    />
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">Full Name</p>
                            <p className="text-base">{user.fullName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">Email</p>
                            <p className="text-base">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">Role</p>
                            <Badge variant={user.role.slug === "super-admin" ? "default" : "secondary"}>
                                {user.role.name}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2">Module Permissions</h3>
                        {user.modules?.length ? (
                            <div className="space-y-3 p-5">
                                {user.modules.map((module: any, i: number) => (
                                    <div key={i}>
                                        <p className="font-medium">{module.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {module.permissions.map((permission: any, j: number) => (
                                                <Badge variant="outline">{permission}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No module permissions assigned.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onOpenChange(false)
                        }}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
