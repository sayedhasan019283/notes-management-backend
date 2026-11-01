import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Used by the $lookup in "posts of a user" (equality on author + newest-first sort + count).
// Single-post reads use the default _id index.
postSchema.index({ author: 1, _id: -1 });

export const Post = model<IPost>('Post', postSchema);
