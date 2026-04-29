const Subject = require("../models/Subject");
const Category = require("../models/Category");

exports.searchAll = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) return res.json({ subjects: [], categories: [] });

        const regex = new RegExp(q, "i");

        const subjects = await Subject.find({
            name: regex,
            isActive: true,
        })
            .populate("categoryId", "displayName")
            .limit(5)
            .lean();

        const categories = await Category.find({
            name: regex,
        })
            .limit(5)
            .lean();

        res.json({
            subjects,
            categories,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};