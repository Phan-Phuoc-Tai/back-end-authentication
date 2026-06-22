import { UserData } from "../types/user.type";
import { prisma } from "../utils/prisma";

const userService = {
  findEmailExist(email: string) {
    return prisma.user.count({
      where: { email },
    });
  },
  create(userData: UserData) {
    return prisma.user.create({
      data: userData,
    });
  },
  findEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },
  findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  },
  updateUserVerified(id: number, isVerified: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isVerified },
    });
  },
  findEmailVerify(email: string, isVerified: boolean) {
    return prisma.user.findUnique({
      where: {
        email,
        isVerified,
      },
    });
  },
  updateUserPassword(id: number, password: string) {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  },
};

export { userService };
