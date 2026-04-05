import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Error loading profile" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    if (newPassword && !String(currentPassword || "").trim()) {
      return res.status(400).json({
        message: "Current password is required when setting a new password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (newPassword) {
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const safe = await User.findById(user._id).select("-password").lean();
    res.json(safe);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error updating profile" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching users" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error updating role" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (String(req.params.id) === String(req.user._id) && isActive === false) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error updating status" });
  }
};
