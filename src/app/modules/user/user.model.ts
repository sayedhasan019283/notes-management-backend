import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
// adjust this path to wherever your paginate plugin lives
import { IUser, IUserModel } from './user.interface';
import paginate from '../../../helpers/paginate';

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    // plain stored value, copied into the JWT at login (your auth middleware reads it)
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Login / profile-by-email / duplicate-email check
userSchema.index({ email: 1 }, { unique: true });

// Multikey index: supports the `interest` filter in the group-by-interests aggregation
userSchema.index({ interests: 1 });

// Admin user list + GET by id are served by the default _id index (sort by -_id = newest first)

userSchema.plugin(paginate);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = model<IUser, IUserModel>('User', userSchema);
