import { Spinner } from "./spinner"

export const CenterSpinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                <Spinner />
            </div>
        </div>
    )
}