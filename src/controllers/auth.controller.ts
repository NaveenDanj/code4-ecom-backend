import express, {Request, Response} from 'express';
import Joi from 'joi';
import User from '../models/user.model';
const router = express.Router();
import passwordService from '../services/password.service';
import jwtService from '../services/jwt.service';
import AuthToken from '../models/authToken.model';
import { IUser } from '../types/types';

router.post('/register' , async (req:Request , res:Response) => {
    
    let validator = Joi.object({
        fullname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    
    try {

        await validator.validateAsync(req.body, { abortEarly: false });

        const hashedPassword = await passwordService.hashPasswod(req.body.password);

        let user = new User({
          fullname: req.body.fullname,
          email: req.body.email,
          password: hashedPassword,
        });
    

        let email_check = await User.findOne({ email: req.body.email });
        if (email_check) {
          return res.status(400).json({
            message: "Email already user in another account!",
          });
        }
    
        let userObject = await user.save();
    
        return res.status(201).json({
          message: "New user created",
          user: userObject,
        });

    } catch (err) {

        return res.status(400).json({
          message: "Error creating user",
          error: err,
        });
    }

})

router.post('/login' , async (req:Request , res:Response) => {

    let validator = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    try{

        const data = await validator.validateAsync(req.body, { abortEarly: false });

        let user:IUser | null = await User.findOne({ email: data.email });

        if (!user) {
            return res.status(400).json({
                message: "Email or password is incorrect!",
            });
        }

        const isMatch = await passwordService.comparePassword(data.password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Email or password is incorrect!",
            });
        }

        let _token = jwtService.generateToken(user.email);

        let accessToken = new AuthToken({
            userId: user.userId,
            token: _token,
        });

        await accessToken.save();

        return res.status(200).json({
            user,
            token: _token,
        });

    }catch(err){
        return res.status(400).json({
            message: "Error in login",
            error: err,
        });
    }

})