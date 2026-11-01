import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { parsePagination } from '../../../shared/parsePagination';
import { NoteService } from './note.service';

const createNote = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.createNote(req.user.id, req.body);
  sendResponse(res, {
    code: httpStatus.CREATED,
    message: 'Note created successfully',
    data: result,
  });
});

const getMyNotes = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.getMyNotes(req.user.id, parsePagination(req.query));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Notes fetched successfully',
    data: result,
  });
});

const getMyNoteById = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.getMyNoteById(req.user.id, req.params.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Note fetched successfully',
    data: result,
  });
});

const updateMyNote = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.updateMyNote(req.user.id, req.params.id, req.body);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Note updated successfully',
    data: result,
  });
});

const deleteMyNote = catchAsync(async (req: Request, res: Response) => {
  await NoteService.deleteMyNote(req.user.id, req.params.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Note deleted successfully',
    data: null,
  });
});

const getAllNotes = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.getAllNotes(parsePagination(req.query));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'All notes fetched successfully',
    data: result,
  });
});

const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const result = await NoteService.getNoteById(req.params.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Note fetched successfully',
    data: result,
  });
});

export const NoteController = {
  createNote,
  getMyNotes,
  getMyNoteById,
  updateMyNote,
  deleteMyNote,
  getAllNotes,
  getNoteById,
};
