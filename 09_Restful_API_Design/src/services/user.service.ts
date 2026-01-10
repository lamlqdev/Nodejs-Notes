import { User } from '../models/user.model';
import { Customer } from '../models/customer.model';
import type { Types } from 'mongoose';
import { AppError } from '../middlewares/error.middleware';
import { hashPassword, comparePassword } from '../utils/password.util';
import type {
  SignUpInput,
  SignInInput,
  UpdateUserInput,
} from '../validations/user.validation';

export async function findUserByEmail(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  return user;
}

export async function findUserById(id: string | Types.ObjectId) {
  const user = await User.findById(id).select('-password');
  return user;
}

export async function createUser(
  data: SignUpInput & { role?: 'admin' | 'user' }
) {
  const { email, password, name, phone, address } = data;
  const role = data.role || 'user';

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || '',
    role,
  });

  // If role is 'user', create customer record
  if (role === 'user') {
    await Customer.create({
      userId: user._id,
      name: name || email.split('@')[0], // Use name or email prefix as default name
      email: email.toLowerCase(),
      phone: phone || '',
      address: address || '',
    });
  }

  // Return user without password
  const userWithoutPassword = await User.findById(user._id).select('-password');
  return userWithoutPassword;
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  return user;
}

export async function updateUser(
  id: string | Types.ObjectId,
  data: UpdateUserInput
) {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If email is being updated, check if it already exists
  if (data.email && data.email !== user.email) {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }
  }

  // Update user
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) user.email = data.email.toLowerCase();

  await user.save();

  // Update customer email if exists
  if (data.email && user.role === 'user') {
    await Customer.findOneAndUpdate(
      { userId: user._id },
      { email: data.email.toLowerCase() }
    );
  }

  // Return user without password
  return await User.findById(user._id).select('-password');
}

export async function updateUserRole(
  id: string | Types.ObjectId,
  role: 'admin' | 'user'
) {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  // If changing from admin to user, create customer record (if needed)
  // If changing from user to admin, remove customer record
  if (oldRole === 'admin' && role === 'user') {
    // Create customer record if doesn't exist
    const existingCustomer = await Customer.findOne({ userId: user._id });
    if (!existingCustomer) {
      await Customer.create({
        userId: user._id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        phone: '',
        address: '',
      });
    }
  } else if (oldRole === 'user' && role === 'admin') {
    // Remove customer record
    await Customer.findOneAndDelete({ userId: user._id });
  }

  return await User.findById(user._id).select('-password');
}
