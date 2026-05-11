import bcryptjs from "bcryptjs";

export const passwordUtil = {
  async hash(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(password, salt);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcryptjs.compare(password, hash);
  },
};
