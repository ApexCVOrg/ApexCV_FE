import { v2 as cloudinary } from 'cloudinary';

// Nếu bạn đã đưa vào biến môi trường .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqmb4e2et',
  api_key: process.env.CLOUDINARY_API_KEY || '334723751781838',
  api_secret: process.env.CLOUDINARY_API_SECRET || '_enIE7zklidejZcKWILjS7qLHqU',
});

export default cloudinary;
