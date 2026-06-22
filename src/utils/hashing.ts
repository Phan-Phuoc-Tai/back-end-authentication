import bcrypt from "bcrypt";

const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

const verifyPassword = (password: string, hashPassword: string) => {
  return bcrypt.compareSync(password, hashPassword);
};

export { hashPassword, verifyPassword };
