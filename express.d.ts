import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // or whatever type userId should be (e.g., number)
    }
  }
}
declare module "multer-storage-cloudinary" {
  import { Cloudinary } from "cloudinary";
  import { StorageEngine } from "multer";

  interface Params {
    folder?: string;
    allowed_formats?: string[];
    public_id?: (req: any, file: any) => string;
  }

  interface CloudinaryStorageOptions {
    cloudinary: Cloudinary;
    params: Params;
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
  }
}
