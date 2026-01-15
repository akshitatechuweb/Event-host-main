import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Generate a signature for a secure upload from the frontend.
 * @param {Object} params - The parameters to include in the signature.
 * @returns {Object} - Signature, timestamp, and metadata.
 */
export const generateUploadSignature = (folder, publicId = null) => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const params = {
        timestamp,
        folder,
    };

    if (publicId) {
        params.public_id = publicId;
        params.invalidate = true; // Clear cache on replacement
    }

    const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
        publicId,
    };
};

/**
 * Delete an image from Cloudinary.
 * @param {string} publicId - The public ID of the image to delete.
 */
export const deleteImage = async (publicId) => {
    if (!publicId) return null;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.warn(`[Cloudinary] Deletion result for ${publicId}:`, result);
        }
        return result;
    } catch (error) {
        console.error(`[Cloudinary] Delete Error for ${publicId}:`, error);
        // Don't throw for cleanup failures, just log them
        return { error: error.message };
    }
};

/**
 * Get a transformed URL for an image.
 * @param {string} publicId - The public ID.
 * @param {Object} options - Transformation options.
 */
export const getTransformedUrl = (publicId, options = {}) => {
    if (!publicId) return null;

    const defaultOptions = {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto',
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Standard folder naming helpers
 */
export const folders = {
    eventCover: (eventId) => `events/${eventId}/cover`,
    userAvatar: (userId) => `users/${userId}/avatar`,
    hostProfile: (hostId) => `hosts/${hostId}/profile`,
    hostDocuments: (hostId) => `hosts/${hostId}/documents`,
    ticketBanner: (ticketId) => `tickets/${ticketId}/banner`,
};

export default {
    generateUploadSignature,
    deleteImage,
    getTransformedUrl,
    folders,
};
