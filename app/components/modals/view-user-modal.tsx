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
    user: {
        fullName: string
        email: string
        role: {
            name: string,
            slug: string
        }
        modules?: {
            name: string
            permissions: { name: string }[]
        }[]
    } | null
}

export function UserInfoModal({ open, onOpenChange, user }: UserInfoModalProps) {

    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader className="pb-5 border-b">
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>

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
                            <div className="space-y-3">
                                {user.modules.map((mod, i) => (
                                    <div key={i}>
                                        <p className="font-medium">{mod.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {mod.permissions.map((perm, j) => (
                                                <Badge key={j} variant="outline">{perm.name}</Badge>
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
