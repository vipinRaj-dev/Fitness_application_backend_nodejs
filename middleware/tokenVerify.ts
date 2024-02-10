import { log } from "console";
import express from "express";
import jwt from "jsonwebtoken";

export let tokenVerify = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let tokenHeader = req.headers.authorization;
    // console.log(tokenHeader );
    

    if (!tokenHeader) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const words: string[] = tokenHeader.split(" ");

    // if (words.length !== 2 || typeof words[1] !== "string") {
    //   return res.status(401).json({ msg: "Invalid token format" });
    // }

    let secretkey: string | undefined = process.env.JWT_SECRET_KEY;

    if (secretkey) {

      let decode: any = jwt.verify(words[1], secretkey);

      
      // console.log(decode);
      // {
      //   email: 'admin@gmail.com',
      //   role: 'admin',
      //   userId: '65c48928c4133be373d8cb8b',
      //   iat: 1707568108
      // }
      
      req.headers["user"] = decode;
      
      next();
    } else {
      return res
        .status(500)
        .json({ msg: "Server error. JWT secret key is missing." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Access denied" });
  }
};
