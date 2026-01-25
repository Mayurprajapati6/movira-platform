import { v2 as cloudinary } from "cloudinary";
import { serverConfig } from "../../config";
import { BadRequestError } from "../errors/app.error";

cloudinary.config({
    cloud_name: serverConfig.CLOUDINARY_CLOUD_NAME,
    api_key: serverConfig.CLOUDINARY_API_KEY,
    api_secret: serverConfig.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const FOLDERS = {
    FACILITIES: 'facilities',
    PROFILES: 'profiles',
    DOCUMENTS: 'documents'
} as const;

function validateImageFile(file: string): void {

    if(!file.startsWith('data:image/')) {
        throw new BadRequestError("Invalid image format. Must be base64 encoded image.");
    }

    const base64Length = file.split(',')[1]?.length || 0;
    const sizeInBytes = (base64Length * 3) / 4;
    
    if (sizeInBytes > MAX_FILE_SIZE) {
        throw new BadRequestError(`Image size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    
    const formatMatch = file.match(/data:image\/(\w+);/);
    const format = formatMatch ? formatMatch[1] : null;
    
    if (!format || !ALLOWED_FORMATS.includes(format)) {
        throw new BadRequestError(`Invalid image format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }
};

export const uploadImage = async (
    file: string, 
    folder: keyof typeof FOLDERS = 'FACILITIES'
) => {
    try {
        
        validateImageFile(file);

        const result = await cloudinary.uploader.upload(file, {
            folder: FOLDERS[folder],
            resource_type: 'image',
            
            
            quality: 'auto:good',
            fetch_format: 'auto',
            
            
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' }, 
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ],
            

            eager: [
                { width: 400, height: 300, crop: 'fill', quality: 'auto:good' }, 
                { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }, 
            ],
            eager_async: true,
        });

        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            thumbnail_url: result.eager?.[0]?.secure_url,
            medium_url: result.eager?.[1]?.secure_url,
        };
    } catch (error: any) {
        if (error instanceof BadRequestError) {
            throw error;
        }
        
        console.error('Cloudinary upload error:', error);
        throw new BadRequestError(
            `Failed to upload image: ${error.message || 'Unknown error'}`
        );
    }
};

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        if (!publicId) {
            throw new BadRequestError("Public ID is required");
        }

        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            return true;
        } else if (result.result === 'not found') {
            console.warn(`Image not found in Cloudinary: ${publicId}`);
            return true; 
        } else {
            console.error(`Failed to delete image: ${publicId}`, result);
            return false;
        }
    } catch (error: any) {
        console.error('Cloudinary delete error:', error);
        throw new BadRequestError(
            `Failed to delete image: ${error.message || 'Unknown error'}`
        );
    }
}

export async function bulkDeleteFromCloudinary(
    publicIds: string[]
): Promise<{ success: string[]; failed: string[] }> {
    const results = {
        success: [] as string[],
        failed: [] as string[]
    };

    const deletePromises = publicIds.map(async (publicId) => {
        try {
            const deleted = await deleteFromCloudinary(publicId);
            if (deleted) {
                results.success.push(publicId);
            } else {
                results.failed.push(publicId);
            }
        } catch (error) {
            results.failed.push(publicId);
        }
    });

    await Promise.allSettled(deletePromises);
    
    return results;
}

export function getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number
): string {
    const transformations: string[] = [];
    
    if (width || height) {
        transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_fill`);
    }
    
    transformations.push('q_auto:good', 'f_auto');
    
    return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true
    });
}

export function getResponsiveImageUrls(publicId: string) {
    return {
        thumbnail: getOptimizedImageUrl(publicId, 400, 300),
        small: getOptimizedImageUrl(publicId, 640, 480),
        medium: getOptimizedImageUrl(publicId, 1024, 768),
        large: getOptimizedImageUrl(publicId, 1920, 1080),
        original: cloudinary.url(publicId, { secure: true })
    };
}














// export const uploadImage = async (file: string) => {
//     return cloudinary.uploader.upload(file, {
//         folder: "facilities",
//     })
// }

// export async function deleteFromCloudinary(publicId: string) {
//   await cloudinary.uploader.destroy(publicId);
// }