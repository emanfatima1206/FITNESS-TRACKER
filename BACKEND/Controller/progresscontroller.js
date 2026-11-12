import Progress from "../Models/progressmodel.js";
import User from "../Models/usermodel.js";

// Add Progress
export const addProgress = async (req, res) => {
  try {
    const {
      weight,
      chest,
      waist,
      hips,
      arms,
      date,
      notes
    } = req.body;

    if (weight === undefined || weight === "") {
      return res.status(400).json({
        message: "Weight is required"
      });
    }

    const progress = new Progress({
      userId: req.user.id,
      weight: Number(weight),
      chest: Number(chest) || 0,
      waist: Number(waist) || 0,
      hips: Number(hips) || 0,
      arms: Number(arms) || 0,
      date: date || new Date(),
      notes: notes || ""
    });

    await progress.save();

    // Update user's current weight
    await User.findByIdAndUpdate(
      req.user.id,
      { weight: Number(weight) }
    );

    res.status(201).json({
      message: "Progress added successfully",
      progress
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Progress
export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(progress);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Progress
export const updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found"
      });
    }

    if (req.body.weight !== undefined) {
      progress.weight = Number(req.body.weight);

      // Update user's current weight
      await User.findByIdAndUpdate(
        req.user.id,
        { weight: Number(req.body.weight) }
      );
    }

    if (req.body.chest !== undefined) {
      progress.chest = Number(req.body.chest);
    }

    if (req.body.waist !== undefined) {
      progress.waist = Number(req.body.waist);
    }

    if (req.body.hips !== undefined) {
      progress.hips = Number(req.body.hips);
    }

    if (req.body.arms !== undefined) {
      progress.arms = Number(req.body.arms);
    }

    if (req.body.date !== undefined) {
      progress.date = req.body.date;
    }

    if (req.body.notes !== undefined) {
      progress.notes = req.body.notes;
    }

    await progress.save();

    res.json({
      message: "Progress updated successfully",
      progress
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Progress
export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!progress) {
      return res.status(404).json({
        message: "Progress record not found"
      });
    }

    await progress.deleteOne();

    res.json({
      message: "Progress deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};