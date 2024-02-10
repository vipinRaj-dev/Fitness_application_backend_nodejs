import bcrypt from 'bcryptjs';

// Hash the password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
 try {
  if (!password) {
    console.error('Password is undefined');
  } else {
    // rest of your code...
    return bcrypt.hash(password, saltRounds);
  }
 } catch (error) {
  console.log(error.message,error) ;
  
 }
};

// Verify the password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};



