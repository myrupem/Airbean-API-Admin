import User from "../models/user.js";

export const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const getUserByUserId = async (userId) => {
  return await User.findOne({ userId })
}