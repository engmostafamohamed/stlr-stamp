import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
}; 
export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
