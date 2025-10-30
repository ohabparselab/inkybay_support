import { Controller } from "react-hook-form";
import ReactQuill from "react-quill-new";

interface RichTextEditorProps {
    control: any;
    name: string;
    label?: string;
    placeholder?: string;
    error?: string;
    minHeight?: number;
}

export function RichTextEditor({
    control,
    name,
    label,
    placeholder = "Enter text...",
    error,
    minHeight = 64,
}: RichTextEditorProps) {
    return (
        <div className="flex flex-col w-full">
            {label && <label className="mb-2 text-sm font-medium">{label}</label>}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div className="relative w-full">
                        <ReactQuill
                            theme="snow"
                            value={field.value || ""}
                            onChange={(content) => {
                                const isEmpty = !content || content === "<p><br></p>" || content.trim() === "<p></p>";
                                field.onChange(isEmpty ? "" : content);
                            }}
                            placeholder={placeholder}
                            className={`min-h-48 border dark:bg-[#151515] rounded-md resize-y h-auto`}
                            modules={{
                                toolbar: [
                                    [{ font: [] }, { size: [] }],
                                    ["bold", "italic", "underline", "strike"],
                                    [{ color: [] }, { background: [] }],
                                    [{ script: "sub" }, { script: "super" }],
                                    [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
                                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                                    ["direction", { align: [] }],
                                    ["link", "image", "video", "formula"],
                                    ["clean"],
                                ],
                            }}
                        />
                    </div>
                )}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
}
