const Category = require("../models/category");

exports.getCategoriesWithSubjects = async (req, res) => {
  try {
    const data = await Category.aggregate([
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "categoryId",
          as: "subjects",
        },
      },

      // 🔥 filter only active subjects (important)
      {
        $addFields: {
          subjects: {
            $filter: {
              input: "$subjects",
              as: "sub",
              cond: { $eq: ["$$sub.isActive", true] },
            },
          },
        },
      },

      // 🔥 fix projection for array
      {
        $project: {
          name: 1,
          displayName: 1,
          subjects: {
            $map: {
              input: "$subjects",
              as: "sub",
              in: {
                _id: "$$sub._id",
                name: "$$sub.name",
                displayName: "$$sub.displayName",
              },
            },
          },
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Category.aggregate([
      {
        $match: {
          _id: new require("mongoose").Types.ObjectId(id),
        },
      },

      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "categoryId",
          as: "subjects",
        },
      },

      {
        $addFields: {
          subjects: {
            $filter: {
              input: "$subjects",
              as: "sub",
              cond: { $eq: ["$$sub.isActive", true] },
            },
          },
        },
      },

      {
        $project: {
          name: 1,
          displayName: 1,
          subjects: {
            $map: {
              input: "$subjects",
              as: "sub",
              in: {
                _id: "$$sub._id",
                displayName: "$$sub.displayName",
                name: "$$sub.name",
              },
            },
          },
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};