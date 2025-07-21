import cloudinary from './index';

/**
 * Uploads a file buffer to Cloudinary.
 * @param fileBuffer - The buffer of the file (e.g. from multer memoryStorage).
 * @param folder - Optional folder name on Cloudinary (default = 'nidas').
 * @returns {Promise<string>} - URL of the uploaded image.
 */
export const uploadImage = async (
  fileBuffer: Buffer,
  folder = 'nidas'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};
