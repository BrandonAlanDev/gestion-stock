import cloudinary from "@/lib/cloudinary";

type UploadImageParams = {
  base64: string;

  folder: string;

  publicId?: string;

  displayName?: string;
};

export async function uploadImage({
  base64,
  folder,
  publicId,
  displayName,
}: UploadImageParams) {
  return cloudinary.uploader.upload(
    base64,
    {
      folder,

      public_id: publicId,

      display_name: displayName,

      overwrite: true,

      resource_type:
        "image",

      format: "webp",

      transformation: [
        {
          fetch_format:
            "auto",

          quality: "auto",
        },
      ],
    }
  );
}