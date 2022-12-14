import express from "express";
import multer from "multer";
import cors from "cors";

import mongoose from "mongoose";
import * as dotenv from 'dotenv';

import { loginValidation, registerValidation, postCreateValidation } from "./validations.js";
import { handleValidationErrors, checkAuth} from "./utils/index.js";
import { UserController, PostController } from './controllers/index.js'

dotenv.config()

mongoose
    .connect(
        process.env.DB
    )
    .then(() => console.log("DB OK"))
    .catch((err) => console.log("DB ERROR", err));
    
const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

app.post("/auth/login", loginValidation, handleValidationErrors, UserController.login);
app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/posts', PostController.getAll);
app.get('/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.listen(4444, (err) => {
    if (err) {
        return console(err);
    }

    console.log("Server OK");
});
