import express, {Request, Response} from 'express';
import Product from '../models/product.model';
import { IUser } from '../types/types';
const router = express.Router();


router.get('/add-to-favourite' , async (req:Request , res:Response) => {
    
    // @ts-ignore
    const id:string = req.query.id

    if(!id) return res.status(400).json({
        message : 'Please provide product id'
    })

    try{
        // @ts-ignore
        const user:IUser = req.user
        const product = await Product.findOne({_id : id})

        if(!product) return res.status(404).json({
            message : 'Product not found!'
        })

        if(user.favouriteProducts.indexOf(product._id) != -1) return res.status(400).json({
            message : 'Product already added to the favourite'
        })

        user.favouriteProducts.push(product._id)
        // @ts-ignore
        await user.save()

        return res.status(200).json({
            message : 'New product added to the favourite',
            user
        })


    }catch(err){

        return res.status(500).json({
            message: 'Internal Server Error',
            error: err,
        });

    }

})

router.get('/remove-from-favourite' , async (req:Request , res:Response) => {
    
    // @ts-ignore
    const id:string = req.query.id

    if(!id) return res.status(400).json({
        message : 'Please provide product id'
    })

    try{
        // @ts-ignore
        const user:IUser = req.user
        const product = await Product.findOne({_id : id})

        if(!product) return res.status(404).json({
            message : 'Product not found!'
        })

        if(user.favouriteProducts.indexOf(product._id) == -1) return res.status(400).json({
            message : 'Product not in favourite list'
        })

        user.favouriteProducts.splice(  user.favouriteProducts.indexOf(product._id) , 1)
        // @ts-ignore
        await user.save()

        return res.status(200).json({
            message : 'Product remove from the favourite',
            user
        })


    }catch(err){

        return res.status(500).json({
            message: 'Internal Server Error',
            error: err,
        });
        
    }

})


export default router
