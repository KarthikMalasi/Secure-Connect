const mongoose = require('mongoose');
const Note = require('../models/Note');
const eventEmitter = require('../events/eventHandler');

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content || !title.trim() || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      userId: req.user.id,
    });

    // Emit noteCreated event
    eventEmitter.emit('noteCreated', note.title);

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: note,
    });
  } catch (error) {
    console.error('Create Note Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating note.',
    });
  }
};

/**
 * @desc    Get all notes belonging to the logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully.',
      data: notes,
    });
  } catch (error) {
    console.error('Get Notes Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving notes.',
    });
  }
};

/**
 * @desc    Get a specific note by ID (only if owned by logged-in user)
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Ensure the note belongs to the authenticated user
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only access your own notes.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note retrieved successfully.',
      data: note,
    });
  } catch (error) {
    console.error('Get Note By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving note.',
    });
  }
};

/**
 * @desc    Update a specific note (only if owned by logged-in user)
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }

    if (!title || !content || !title.trim() || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required for updating.',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Prevent modifying another user's note
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only update your own notes.',
      });
    }

    note.title = title.trim();
    note.content = content.trim();
    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Update Note Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating note.',
    });
  }
};

/**
 * @desc    Delete a specific note (only if owned by logged-in user)
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Prevent deleting another user's note
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only delete your own notes.',
      });
    }

    await note.deleteOne();

    // Emit noteDeleted event
    eventEmitter.emit('noteDeleted');

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
      data: {},
    });
  } catch (error) {
    console.error('Delete Note Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting note.',
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
