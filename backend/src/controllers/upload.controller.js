import { uploadToCloudinary } from '../middleware/upload.middleware.js';
import { ApiError } from '../utils/apiError.js';

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, 'No file provided');
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    next(err);
  }
}
