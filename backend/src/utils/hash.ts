import { createHash } from "node:crypto";

import bcrypt from "bcryptjs";

export const comparePassword = async (
  plainTextPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, passwordHash);
};

export const hashToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};
