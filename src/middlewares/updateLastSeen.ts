import express from "express";
import { UserModel } from "../models";

export default (
  req: any, //express.Request
  __: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        last_seen: new Date()
      },
      { new: true },
      () => {} // без collback-а не работает
    );
    next();
  }
};