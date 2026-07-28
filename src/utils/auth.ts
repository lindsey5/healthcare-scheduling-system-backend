import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

export const verifyPassword = async (password : string, hashedPassword : string)=> {
  return await bcrypt.compare(password, hashedPassword);
};

// Hash a plain password
export const hashPassword = async (password : string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

// Generate JWT Access Token
export const generateAccessToken = (user_id : number, role : string): string => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_ACCESS_EXPIRES_IN) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(
    { id: user_id, role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions, 
    } as SignOptions
  );
};

// Generate JWT Refresh Token
export const generateRefreshToken = (user_id: number, role: string): string => {
  if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_REFRESH_EXPIRES_IN) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { id: user_id, role },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, 
    } as SignOptions
  );
};