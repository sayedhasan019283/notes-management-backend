import { Document, FilterQuery, Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export interface INote extends Document {
  title: string;
  content: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteModel extends Model<INote> {
  paginate(
    filter: FilterQuery<INote>,
    options: PaginateOptions
  ): Promise<PaginateResult<INote>>;
}
