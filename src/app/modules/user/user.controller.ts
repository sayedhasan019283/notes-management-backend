import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { parsePagination } from '../../../shared/parsePagination';
import { UserService } from './user.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  console.log('touch hear!');
  const result = await UserService.loginUser(req.body);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Login successful',
    data: result,
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    code: httpStatus.CREATED,
    message: 'User created successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.user.id);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(parsePagination(req.query));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'Users fetched successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(
    req.params.id as string as string,
  );
  console.log(typeof (req.params.id as string));
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'User fetched successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(
    req.params.id as string as string,
    req.body,
  );
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.deleteUser(req.params.id as string);
  sendResponse(res, {
    code: httpStatus.OK,
    message: 'User deleted successfully',
    data: null,
  });
});

const getUsersGroupedByInterests = catchAsync(
  async (req: Request, res: Response) => {
    const interest =
      typeof req.query.interest === 'string' && req.query.interest.trim()
        ? req.query.interest.trim().toLowerCase()
        : undefined;

    const result = await UserService.getUsersGroupedByInterests({
      ...parsePagination(req.query),
      interest,
    });
    sendResponse(res, {
      code: httpStatus.OK,
      message: 'Users grouped by interests fetched successfully',
      data: result,
    });
  },
);

export const UserController = {
  loginUser,
  createUser,
  getMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
};
