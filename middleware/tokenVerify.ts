import express from "express";
import jwt from "jsonwebtoken";

export const tokenVerify = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log("yes token verified");
  try {
    const tokenHeader = req.headers.authorization;
    // console.log(tokenHeader  , req.headers);

    if (!tokenHeader) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const words: string[] = tokenHeader.split(" ");

    // if (words.length !== 2 || typeof words[1] !== "string") {
    //   return res.status(401).json({ msg: "Invalid token format" });
    // }

    const secretkey: string | undefined = process.env.JWT_SECRET_KEY;

    if (secretkey) {
      if (typeof words[1] !== "string" || words[1].split(".").length !== 3) {
        return res.status(401).json({ msg: "Invalid token format" });
      } else {
        const decode: any = jwt.verify(words[1], secretkey);

        req.headers["user"] = decode;
      }

      // console.log(decode);
      // {
      //   email: 'admin@gmail.com',
      //   role: 'admin',
      //   userId: '65c48928c4133be373d8cb8b',
      //   iat: 1707568108
      // }

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
