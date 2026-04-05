import Record from "../models/record.model.js";
import { logRecordAudit } from "../services/auditLog.service.js";


const buildFilter = (req) => {
  const { type, category, startDate, endDate, search } = req.query;
  const filter = { deletedAt: null };

  if (type) filter.type = type;

  const clauses = [];
  if (category?.trim()) {
    clauses.push({ category: new RegExp(category.trim(), "i") });
  }
  if (search?.trim()) {
    const rx = new RegExp(search.trim(), "i");
    clauses.push({ $or: [{ notes: rx }, { category: rx }] });
  }
  if (clauses.length === 1) Object.assign(filter, clauses[0]);
  else if (clauses.length > 1) filter.$and = clauses;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

const populateCreator = { path: "createdBy", select: "name email role" };

export const createRecord = async (req, res) => {
  try {
    const record = await Record.create({
      ...req.body,
      createdBy: req.user._id,
      deletedAt: null,
    });
    const full = await Record.findById(record._id).populate(populateCreator);
    await logRecordAudit({
      actorId: req.user._id,
      action: "create",
      recordId: full._id,
      summary: `Created ${full.type} ₹${Number(full.amount).toLocaleString()} — ${full.category}`,
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error creating record" });
  }
};

export const getRecords = async (req, res) => {
  try {
    const filter = buildFilter(req);
    const sort = { date: -1, createdAt: -1 };
    const wantsPagination =
      req.query.page !== undefined || req.query.limit !== undefined;

    if (wantsPagination) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        Record.find(filter)
          .populate(populateCreator)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Record.countDocuments(filter),
      ]);
      return res.json({ data, page, limit, total });
    }

    const data = await Record.find(filter).populate(populateCreator).sort(sort);
    res.json({ data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching records" });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.deletedAt;
    delete body.createdBy;

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      body,
      { new: true, runValidators: true }
    ).populate(populateCreator);

    if (!record) {
      return res
        .status(404)
        .json({ message: "Record not found or has been archived" });
    }

    await logRecordAudit({
      actorId: req.user._id,
      action: "update",
      recordId: record._id,
      summary: `Updated ${record.type} ₹${Number(record.amount).toLocaleString()} — ${record.category}`,
    });

    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message || "Error updating record" });
  }
};


export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    await logRecordAudit({
      actorId: req.user._id,
      action: "archive",
      recordId: record._id,
      summary: `Archived ${record.type} ₹${Number(record.amount).toLocaleString()} — ${record.category}`,
    });

    res.json({
      message: "Record archived (soft deleted)",
      deletedAt: record.deletedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error archiving record" });
  }
};


export const restoreRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true, runValidators: true }
    ).populate(populateCreator);

    if (!record) {
      return res
        .status(404)
        .json({ message: "Record not found or not archived" });
    }

    await logRecordAudit({
      actorId: req.user._id,
      action: "restore",
      recordId: record._id,
      summary: `Restored ${record.type} ₹${Number(record.amount).toLocaleString()} — ${record.category}`,
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message || "Error restoring record" });
  }
};
