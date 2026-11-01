import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import bcrypt from 'bcrypt';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { User } from './user.model';
import { IUser } from './user.interface';
import { CreateUserInput, LoginInput, UpdateUserInput } from './user.validation';
import { Note } from '../note/note.model';
import { Post } from '../post/post.model';

interface PaginationOptions {
  page: number;
  limit: number;
}

const normalizeInterests = (list?: string[]) => [
  ...new Set((list ?? []).map((i) => i.trim().toLowerCase()).filter(Boolean)),
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanitize = (user: IUser) => {
  const { password: _pw, ...rest } = user.toObject();
  return rest;
};

const loginUser = async (payload: LoginInput) => {
  // uses the unique { email: 1 } index; password is select:false so it must be requested
  const user = await User.findOne({ email: payload.email.toLowerCase() }).select('+password');

  const isPasswordValid = user ? await bcrypt.compare(payload.password, user.password) : false;
  if (!user || !isPasswordValid) {
    // same message for both cases so emails can't be enumerated
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const tokenPayload = { id: user._id, email: user.email, role: user.role };

  const accessToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.accessExpirationTime
  );
  const refreshToken = jwtHelper.createToken(
    tokenPayload,
    config.jwt.accessSecret as Secret,
    config.jwt.refreshExpirationTime
  );

  return { user: sanitize(user), tokens: { accessToken, refreshToken } };
};

const createUser = async (payload: CreateUserInput) => {
  const email = payload.email.toLowerCase();
  if (await User.exists({ email })) {
    throw new AppError(httpStatus.CONFLICT, 'Email already in use');
  }

  const user = await User.create({
    name: payload.name,
    email,
    password: payload.password,
    interests: normalizeInterests(payload.interests),
  });

  return sanitize(user);
};

const getAllUsers = async ({ page, limit }: PaginationOptions) => {
  return User.paginate({}, { page, limit, sortBy: '-_id' });
};

const getUserById = async (id: string) => {
  const user = await User.findById(id).lean();
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};

const updateUser = async (id: string, payload: UpdateUserInput) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  if (payload.email) {
    const email = payload.email.toLowerCase();
    if (email !== user.email && (await User.exists({ email }))) {
      throw new AppError(httpStatus.CONFLICT, 'Email already in use');
    }
    user.email = email;
  }
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.interests !== undefined) user.interests = normalizeInterests(payload.interests);
  if (payload.password !== undefined) user.password = payload.password; // hashed by pre-save hook

  await user.save();
  return sanitize(user);
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id).lean();
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // cascade: both use the (owner/author, _id) indexes
  await Promise.all([Note.deleteMany({ owner: id }), Post.deleteMany({ author: id })]);
  return null;
};

/**
 * Scenario 1: users grouped by interest — exactly ONE User.aggregate() call.
 * Optional `interest` filter uses the multikey index on `interests`.
 */
const getUsersGroupedByInterests = async ({
  page,
  limit,
  interest,
}: PaginationOptions & { interest?: string }) => {
  const skip = (page - 1) * limit;
  const match = interest ? [{ $match: { interests: interest } }] : [];

  const [result] = await User.aggregate([
    ...match, // index-backed narrowing of users
    { $unwind: '$interests' },
    ...match, // keep only the requested group after unwinding
    {
      $group: {
        _id: '$interests',
        count: { $sum: 1 },
        users: { $push: { _id: '$_id', name: '$name', email: '$email' } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $facet: {
        results: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, interest: '$_id', count: 1, users: 1 } },
        ],
        meta: [{ $count: 'totalResults' }],
      },
    },
  ]);

  const totalResults = result?.meta?.[0]?.totalResults ?? 0;
  return {
    results: result?.results ?? [],
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

export const UserService = {
  loginUser,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
};
