import mongoose, { Schema, Document } from "mongoose";
import { isEmail } from "validator";
import { generatePasswordHash } from "../utils";
import differenceInMinutes from "date-fns/differenceInMinutes";
import parseISO from 'date-fns/parseISO'

export interface IUser extends Document {
  email?: string;
  fullname?: string;
  password?: string;
  confirmed?: boolean;
  avatar?: string;
  confirm_hash?: string;
  last_seen?: Date;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      require: "Email address is required",
      validate: [isEmail, "Invalid email"],
      unique: true
    },
    fullname: {
      type: String,
      required: "Fullname is required"
    },
    password: {
      type: String,
      required: "Password is required"
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    avatar: String,
    confirm_hash: String,
    last_seen: {
      type: Date,
      default: new Date()
    }
  },
  {
    timestamps: true
  }
);

// если пользователь не проявляет активность в течении 5 минут, он становится ofline
UserSchema.virtual("isOnline").get(function(this: any) {
  let date = parseISO(new Date().toISOString())
  return differenceInMinutes(date, this.last_seen.toISOString()) < 5;
});

UserSchema.set("toJSON", {
  virtuals: true
});

UserSchema.pre("save", function(next) {
  const user: IUser = this;

  if (!user.isModified("password")) return next();

  generatePasswordHash(user.password)
    .then(hash => {
      user.password = String(hash);
      generatePasswordHash(+new Date()).then(confirmHash => {
        user.confirm_hash = String(confirmHash);
        next();
      });
    })
    .catch(err => {
      next(err);
    });
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;