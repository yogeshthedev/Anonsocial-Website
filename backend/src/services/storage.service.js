import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadFile = async (fileBuffer, fileName) => {
  try {
    // convert buffer to base64
    const base64 = fileBuffer.toString("base64");

    const response = await client.upload({
      file: base64, // base64 string
      fileName,
      folder: "avatars/",
      useUniqueFileName: true,
    });

    return response; // { url, fileId, ... }
  } catch (err) {
    // rethrow so controller can handle
    throw err;
  }
};
