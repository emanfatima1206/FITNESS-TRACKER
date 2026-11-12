import Reminder from "../Models/remindermodel.js";

// Add Reminder
export const addReminder = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      datetime,
      type,
      enabled
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Reminder title is required"
      });
    }

    const reminder = new Reminder({
      userId: req.user.id,
      title: title,
      description: description || "",
      date: date || "",
      time: time || "",
      datetime: datetime || null,
      type: type || "Workout",
      enabled: enabled !== undefined ? enabled : true
    });

    await reminder.save();

    res.status(201).json({
      message: "Reminder added successfully",
      reminder
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Get Reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(reminders);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Update Reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    if (req.body.title !== undefined) {
      reminder.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      reminder.description = req.body.description;
    }

    if (req.body.date !== undefined) {
      reminder.date = req.body.date;
    }

    if (req.body.time !== undefined) {
      reminder.time = req.body.time;
    }

    if (req.body.datetime !== undefined) {
      reminder.datetime = req.body.datetime;
    }

    if (req.body.type !== undefined) {
      reminder.type = req.body.type;
    }

    if (req.body.enabled !== undefined) {
      reminder.enabled = req.body.enabled;
    }

    await reminder.save();

    res.json({
      message: "Reminder updated successfully",
      reminder
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// Delete Reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found"
      });
    }

    await reminder.deleteOne();

    res.json({
      message: "Reminder deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};