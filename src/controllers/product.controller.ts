import express, {NextFunction, Request, Response} from 'express';
import Joi from 'joi';
const router = express.Router();
import upload from '../services/upload.service';
import Product from '../models/product.model';
import fs from 'fs'

router.post(
    '/create-product',
    upload.fields([{ name: 'images', maxCount: 8 }]),
    async (req: Request, res: Response, next: NextFunction) => {

      const validator = Joi.object({
        sku: Joi.string().required(),
        productName: Joi.string().required(),
        description: Joi.string().required(),
        quantity: Joi.number().required(),
        thumbnail: Joi.number().required(),
      });
  
      try {
        const data = await validator.validateAsync(req.body, { abortEarly: false });
  
        const productSearch = await Product.findOne({ sku: data.sku });
  
        if (productSearch) {
            // @ts-ignore
            upload_rollback(req.files['images'] as Express.Multer.File[])

            return res.status(400).json({
                message: 'Product SKU is already assigned to another product!',
            });
        }
  
        if (data.quantity < 0) {

            // @ts-ignore
            upload_rollback(req.files['images'] as Express.Multer.File[])

            return res.status(400).json({
                message: 'Invalid quantity!',
            });
        }
  
        next();
      } catch (err) {

        // @ts-ignore
        upload_rollback(req.files['images'] as Express.Multer.File[])

        return res.status(400).json({
          message: 'Error while creating product',
          error: err,
        });
      }
    },
    
    async (req: Request, res: Response) => {
      try {
        // @ts-ignore
        if (!req.files || !req.files['images']) {

            // @ts-ignore
            upload_rollback(req.files['images'] as Express.Multer.File[])

            return res.status(400).json({
                message: 'Please upload product images',
            });
        }
  
        // @ts-ignore
        const images = req.files['images'];
  
        const product = new Product({
          sku: req.body.sku,
          productName: req.body.productName,
          description: req.body.description,
          quantity: req.body.quantity,
          images: images.map((file: Express.Multer.File) => file.filename),
          thumbnail: req.body.thumbnail,
        });
  
        await product.save();
  
        return res.status(200).json({
          message: 'New product added',
          product,
          images: images.map((file: Express.Multer.File) => file.filename),
        });

      } catch (err) {
        // @ts-ignore
        upload_rollback(req.files['images'] as Express.Multer.File[])

        return res.status(400).json({
          message: 'Error while creating product',
          error: err,
        });
      }
    }
);

async function upload_rollback(files:Express.Multer.File[]){
    try{
        const deletionPromises = files.map((filePath) => deleteFile(filePath.filename));
        await Promise.all(deletionPromises);
        console.log('Files deleted successfully');
    }catch(err){
        console.error('Error deleting files:', err);
    }

}

const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.unlink("uploads/"+ filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
};

export default router;