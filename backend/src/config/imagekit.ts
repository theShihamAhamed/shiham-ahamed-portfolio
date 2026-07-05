import ImageKit from "@imagekit/nodejs";

import { env } from "./env";

export const imagekit = new ImageKit({
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
});

export const imagekitConfig = {
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
};
