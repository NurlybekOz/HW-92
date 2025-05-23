import express from "express";
import {Error} from 'mongoose';
import User from "../modules/User";

const usersRouter = express.Router();

usersRouter.post('/', async (req, res, next) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });

        user.generateToken();
        await user.save();
        res.send({user, message: 'users registered successfully.'});
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            res.status(400).send(error);
            return;
        }

        next(error);
    }
});

usersRouter.post('/sessions', async (req, res, _next) => {
    if (!req.body.username || !req.body.password) {
        res.status(400).send({error: 'Username and password must be in req'});
        return;
    }

    const user = await User.findOne({username: req.body.username});

    if (!user) {
        res.status(404).send({error: "Username not found"});
        return;
    }

    const isMath = await user.checkPassword(req.body.password);

    if (!isMath) {
        res.status(400).send({error: 'Password is incorrect'});
        return;
    }

    user.generateToken();
    await user.save();

    res.send({message: 'Username and password is correct', user});
});

usersRouter.delete('/sessions', async (req, res, next) => {
    const token = req.get('Authorization');

    if (!token) {
        res.send({message: 'Success logout'});
        return
    }
    try {
        const user = await User.findOne({token});

        if (user) {
            user.generateToken()
            await user.save();
        }

        res.send({message: 'Success logout'});

    } catch (error) {
        next(error);
    }

});



export default usersRouter;