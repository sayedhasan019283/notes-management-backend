import { Schema, model } from 'mongoose';
// adjust this path to wherever your paginate plugin lives
import { INote, INoteModel } from './note.interface';
import paginate from '../../../helpers/paginate';

const noteSchema = new Schema<INote, INoteModel>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// "My notes" list (filter by owner, newest first). ObjectId is time-ordered, so sort by _id.
// Also serves countDocuments({ owner }) and findOne({ _id, owner }).
noteSchema.index({ owner: 1, _id: -1 });

// Admin "all notes" list sorts by -_id -> default _id index, no extra index needed.

noteSchema.plugin(paginate);

export const Note = model<INote, INoteModel>('Note', noteSchema);
