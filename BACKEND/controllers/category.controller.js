const Category = require("../models/category");

exports.getCategoriesWithSubjects = async (req, res) => {
  try {
    const data = await Category.aggregate([
      {
        $lookup: {
          from: "subjects", // collection name in MongoDB
          localField: "_id",
          foreignField: "categoryId",
          as: "subjects"
        }
      },
      {
        $project: {
          name: 1,
          displayName: 1,
          subjects: {
            _id: 1,
            name: 1,
            displayName: 1
          }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};