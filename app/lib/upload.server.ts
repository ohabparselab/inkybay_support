import fs from 'fs/promises';
import path from 'path';

export async function uploadFile(file: File | null, folderPath = "public/uploads") {

    try {
       
        if (!file) return null;

        // Only accept certain file types
        // if (!["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"].includes(file.type)) {
        //     throw new Error("Invalid file type");
        // }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadDir = path.join(process.cwd(), folderPath);
        await fs.mkdir(uploadDir, { recursive: true });

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);

        return `/uploads/${fileName}`;
    } catch (error: any) {
        console.log(error);
        throw new Error(error)
    }
}
