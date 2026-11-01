import { Document, FilterQuery, Model } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  paginate(
    filter: FilterQuery<IUser>,
    options: PaginateOptions
  ): Promise<PaginateResult<IUser>>;
}
