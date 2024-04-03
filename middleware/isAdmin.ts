import express from "express";

export let isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
    console.log("yes admin verified")
  try {
    let requstedUser: string | string[] | any = req.headers["user"];

    if (requstedUser.role !== "admin") {
      return res.status(401).json({ msg: "Not authorized" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Access denied" });
  }
};
