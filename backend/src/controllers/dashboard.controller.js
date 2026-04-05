import Record from "../models/record.model.js";

function getDashboardScope(req) {
  const role = req.user.role;
  const wantsAll = req.query.scope === "all";

  if (role === "viewer" || role === "analyst") {
    return {
      match: { deletedAt: null },
      recentMatch: { deletedAt: null },
      meta: {
        scope: "organization",
        description: "All users — same data as the shared transaction list",
      },
    };
  }

  if (role === "admin" && wantsAll) {
    return {
      match: { deletedAt: null },
      recentMatch: { deletedAt: null },
      meta: { scope: "organization", description: "All users (admin: whole organization)" },
    };
  }

  const mine = { createdBy: req.user._id, deletedAt: null };
  return {
    match: mine,
    recentMatch: mine,
    meta: { scope: "personal", description: "Only rows you created (admin: my records)" },
  };
}

export const getSummary = async (req, res) => {
  try {
    const { match, recentMatch, meta } = getDashboardScope(req);

    const [income, expense, categoryWise, monthly, weekly, recent] =
      await Promise.all([
        Record.aggregate([
          { $match: { ...match, type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Record.aggregate([
          { $match: { ...match, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Record.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$category",
              income: {
                $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
              },
              expense: {
                $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Record.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                y: { $year: "$date" },
                m: { $month: "$date" },
              },
              income: {
                $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
              },
              expense: {
                $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
              },
            },
          },
          { $sort: { "_id.y": 1, "_id.m": 1 } },
        ]),
        Record.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                year: { $isoWeekYear: "$date" },
                week: { $isoWeek: "$date" },
              },
              income: {
                $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
              },
              expense: {
                $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.week": 1 } },
          { $limit: 12 },
        ]),
        recentMatch
          ? Record.find(recentMatch)
              .sort({ date: -1, createdAt: -1 })
              .limit(10)
              .select("amount type category date notes createdAt updatedAt createdBy")
              .populate("createdBy", "name email role")
              .lean()
          : Promise.resolve([]),
      ]);

    const totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryWise,
      monthlyTrends: monthly,
      weeklyTrends: weekly,
      recentActivity: recent,
      dashboardScope: meta.scope,
      dashboardScopeNote: meta.description,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error building dashboard summary" });
  }
};
