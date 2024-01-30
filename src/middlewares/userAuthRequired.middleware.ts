import express, {Request, Response , NextFunction} from 'express';
import AuthToken from '../models/authToken.model';
import jwt from "jsonwebtoken";
import User from '../models/user.model';

const AuthRequired = () => {

    return async (req:Request, res:Response, next:NextFunction) => {

        const token = req.headers["authorization"];
    
        if (!token) {
            return res.status(401).send({ error: "Unauthenticated" });
        }
    
        try {

            let checkExists = await AuthToken.findOne({ token: token });

            if (!checkExists) {
                return res.status(401).send({ error: "Unauthenticated" });
            }

        } catch (err) {
            return res.status(401).send({ error: "Unauthenticated" });
        }
    
        jwt.verify(token, process.env.JWT_SECRET+'', async (err, userObject) => {
            
            if (err) return res.status(403).json({ message: "Unauthenticated" });

            try {
                // @ts-ignore
                let user = await User.findOne({ email: userObject.email }).select(
                    "-password"
                );
                
                // @ts-ignore
                req.user = user;

                next();
            } catch (err) {
                return res.status(401).send({ error: "Unauthenticated" });
            }

        });

    };
};

export default AuthRequired