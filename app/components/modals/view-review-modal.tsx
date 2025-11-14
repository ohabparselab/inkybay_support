import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Star } from "lucide-react"
import { ShopDetails } from "../shop-details"
import { ShopHistory } from "../shop-history"

interface ReviewDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    review: any
}

export function ReviewDetailsModal({ open, onOpenChange, review }: ReviewDetailsModalProps) {
    if (!review) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Review Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                            <p className="text-muted-foreground">Project</p>
                            <p className="font-medium">
                                {review.project?.name || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Shop Name</p>
                            <p className="font-medium">
                                {review.shopName || review.chat?.shopName || review.chat?.client?.shopName || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Shop URL</p>
                            <p className="font-medium break-words">
                                {
                                    review.shopUrl || review.chat?.shopUrl || review.chat?.client?.shopDomain ||
                                    review.meeting?.storeUrl || "—"
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Agent Rating</p>
                            <p className="font-medium">
                                <div className="flex">
                                    {review?.agentRating ? (
                                        [...Array(10)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-6 w-6 ${i < (review?.agentRating || 0)
                                                    ? "text-yellow-500 fill-yellow-500"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        ))
                                    ) : ' N/A'}
                                </div>
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Rating Mood</p>
                            <p className="font-medium">{review.ratingMood || "—"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Approach By</p>
                            <p className="font-medium">
                                {review.approachByUser?.fullName || "_"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Created By</p>
                            <p className="font-medium">
                                {review.createdByUser?.fullName || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Last Approach Date</p>
                            <p className="font-medium">
                                {review.lastReviewApproach
                                    ? format(new Date(review.lastReviewApproach), "dd MMM yyyy")
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Review Submitted</p>
                            <p className="font-medium">
                                {review.reviewSubmittedAt
                                    ? format(new Date(review.reviewSubmittedAt), "dd MMM yyyy")
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <p className="text-muted-foreground mb-1">Review Text</p>
                        <p className="whitespace-pre-line text-sm">{review.reviewText}</p>
                    </div>
                    <Separator />
                    <ShopDetails shopUrl={review.shopUrl || review.chat?.shopUrl || review.chat?.client?.shopDomain || review.meeting?.storeUrl} />
                    <Separator />
                    <ShopHistory shopUrl={review.shopUrl || review.chat?.shopUrl || review.chat?.client?.shopDomain || review.meeting?.storeUrl} />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
