import { Types } from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { Note } from './note.model';
import { CreateNoteInput, UpdateNoteInput } from './note.validation';

interface PaginationOptions {
  page: number;
  limit: number;
}

const createNote = async (ownerId: string, payload: CreateNoteInput) => {
  return Note.create({
    title: payload.title,
    content: payload.content,
    owner: new Types.ObjectId(ownerId),
  });
};

const getMyNotes = async (ownerId: string, { page, limit }: PaginationOptions) => {
  return Note.paginate(
    { owner: new Types.ObjectId(ownerId) },
    { page, limit, sortBy: '-_id' }
  );
};

const getMyNoteById = async (ownerId: string, noteId: string) => {
  const note = await Note.findOne({ _id: noteId, owner: ownerId }).lean();
  if (!note) throw new AppError(httpStatus.NOT_FOUND, 'Note not found');
  return note;
};

const updateMyNote = async (ownerId: string, noteId: string, payload: UpdateNoteInput) => {
  // whitelist fields so nothing else (e.g. owner) can ever be $set from the body
  const update: UpdateNoteInput = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.content !== undefined) update.content = payload.content;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, owner: ownerId },
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

  if (!note) throw new AppError(httpStatus.NOT_FOUND, 'Note not found');
  return note;
};

const deleteMyNote = async (ownerId: string, noteId: string) => {
  const note = await Note.findOneAndDelete({ _id: noteId, owner: ownerId }).lean();
  if (!note) throw new AppError(httpStatus.NOT_FOUND, 'Note not found');
  return note;
};

// ---- admin ----
const getAllNotes = async ({ page, limit }: PaginationOptions) => {
  return Note.paginate(
    {},
    { page, limit, sortBy: '-_id', populate: { path: 'owner', select: 'name email' } }
  );
};

const getNoteById = async (noteId: string) => {
  const note = await Note.findById(noteId).populate('owner', 'name email').lean();
  if (!note) throw new AppError(httpStatus.NOT_FOUND, 'Note not found');
  return note;
};

export const NoteService = {
  createNote,
  getMyNotes,
  getMyNoteById,
  updateMyNote,
  deleteMyNote,
  getAllNotes,
  getNoteById,
};
