const express = require('express');
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');


// ROUTE 1 : Fetch all notes of logged in user. GET : "api/notes/fetchallnotes". Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        let notes = await Note.find({ user: userId });
        res.json(notes);
    }
    catch (error) {
        res.status(500).send({ error: "Internal Server Error (notes)", stackTrace: error });
    }

});


// ROUTE 2 : Add a new note. POST : "api/auth/addnote". Login Required
router.post("/addnote",
    fetchuser,
    [
        body("title", "Min. length : 3 ").isLength({ min: 3 }),
        body("description", "Min. length : 5 ").isLength({ min: 5 }),

    ],
    async (req, res) => {
        try {
            // If there are any validation errors in email and password, send 400 and errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, tag } = req.body;
            const note = await Note({
                title, description, tag, user: req.user.id
            });
            const savedNote = await note.save();
            res.send(savedNote);
        }
        catch (error) {
            res.status(500).send({ error: "Internal Server Error (notes)", stackTrace: error });
        }
    }
);


// ROUTE 3 : Update an existing note. PUT : "api/auth/updatenote". Login Required
router.put("/updatenote/:id",
    fetchuser,
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const newNote = {};
            if (title) newNote.title = title;
            if (description) newNote.description = description;
            if (tag) newNote.tag = tag;


            let note = await Note.findById(req.params.id);
            if (!note) {
                res.status(404).send("No note with this id");
            }

            // Update only if note is own by current user
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }

            note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

            res.json({ updatedNote: note });
        }
        catch (error) {
            res.status(500).send({ error: "Internal Server Error (notes)", stackTrace: error });
        }
    }
);


// ROUTE 3 : Delete an existing note. DELETE : "api/auth/deletenote". Login Required
router.delete("/deletenote/:id",
    fetchuser,
    async (req, res) => {
        try {
            console.log(req.params.id);
            let note = await Note.findById(req.params.id);
            if (!note) {
                res.status(404).send("No note with this id");
            }

            // Delete only if note is own by current user
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }

            note = await Note.findByIdAndDelete(req.params.id);

            res.json({ deletedNote: note });
        }
        catch (error) {
            res.status(500).send({ error: "Internal Server Error (notes)", stackTrace: error });
        }
    }
);

module.exports = router;
