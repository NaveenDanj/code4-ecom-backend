import express, {NextFunction, Request, Response} from 'express';
import Joi from 'joi';
const router = express.Router();
import upload from '../services/upload.service';
import Product from '../models/product.model';
import fs from 'fs'
import { IProduct } from '../types/types';

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

router.get('/get-product' , async (req: Request, res: Response) =>{
    
  const id = req.query.id

  if(!id) return res.status(400).json({
    message : 'Please provide product id'
  })

  try{

    const product = await Product.findOne({ _id : id })

    if(!product){
      return res.status(404).json({
        message : 'product not found',
        product : null
      })
    }

    return res.status(200).json({
      message : 'success',
      product
    })

  }catch(err){

    return res.status(500).json({
      message : 'error while fetching product',
      product: null
    })

  }

})

router.get('/get-all-products' , async (req: Request, res: Response) => {
  // @ts-ignore
  let page = req.query.page as number || 1;
  // @ts-ignore
  let limit = req.query.limit as number || 20;
  let skip = (page - 1) * limit;

  try{
    
    let products = await Product.find()
      .skip(skip)
      .limit(limit);
    
    return res.status(200).json({
      products,
      paging: {
        count: await Product.countDocuments(),
        page: page,
        limit: limit,
      },
    });

  }catch(err){
    return res.status(500).json({
      message: 'Error while fetching products',
    });
  }

})

router.delete('/delete-product' , async (req: Request, res: Response) => {

  // @ts-ignore
  const id:string = req.query.id

  if(!id) return res.status(400).json({
    message : 'Please provide product id'
  })

  try{

    const product:IProduct | null = await Product.findOne({ _id : id })

    if(!product) return res.status(404).json({
      message : 'Product not found!'
    })

    for(let i = 0; i < product.images.length; i++){
      try{
        await deleteFile(product.images[i])
      }catch(err){
        continue
      }
    }

    await Product.deleteMany({ _id : id })

    return res.status(200).json({
      message: 'Product deleted successfully!',
    });

  }catch(err){
    return res.status(500).json({
      message: 'Error while deleting product ' + err,
    });
  }

})

router.put('/edit-product-details' , async (req: Request, res: Response) => {

  // @ts-ignore
  const id:string = req.query.id

  if(!id) return res.status(400).json({
    message : 'Please provide product id'
  })

  const validator = Joi.object({
    sku: Joi.string().required(),
    productName: Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().required(),
  });


  try{

    let data;

    try{
      data = await validator.validateAsync(req.body, { abortEarly: false });
    }catch(err){
      return res.status(400).json({
        message: 'Error while editing product',
        error : err
      });
    }

    if(data.quantity < 0){
      return res.status(400).json({
        message : 'Quantity cannot be less than 0'
      })
    }

    const check_sku = await Product.findOne({ sku : data.sku })

    if(check_sku && check_sku._id != id) return res.status(400).json({
      message : 'This sku is assigned to another product!'
    })

    const product = await Product.findOne({_id : id});

    if(!product) return res.status(404).json({
      message : 'Product not found!'
    })


    await Product.updateOne(
      { _id : id } ,
      {$set : { 
        sku : data.sku,
        productName: data.productName,
        description: data.description,
        quantity: data.quantity
      }}
    )

    return res.status(200).json({
      message : 'product updated successfully!',
      product : await Product.findById(id)
    })

  }catch(err){
    return res.status(500).json({
      message: 'Error while editing product',
    });
  }


})

router.put('/edit-product-delete-image' , async (req: Request, res: Response) => {

  // @ts-ignore
  const id:string = req.query.id

  if(!id) return res.status(400).json({
    message : 'Please provide product id'
  })

  const validator = Joi.object({
    filename: Joi.string().required(),
  });

  try{

    let data;

    try{
      data = await validator.validateAsync(req.body, { abortEarly: false });
    }catch(err){
      return res.status(400).json({
        message: 'Error while editing product',
        error : err
      });
    }

    const product = await Product.findOne({_id : id});

    if(!product) return res.status(404).json({
      message : 'Product not found!'
    })

    // @ts-ignore
    if(product.images.indexOf(data.filename) == -1){
      return res.status(404).json({
        message : 'Image file not found!'
      })
    }

    // @ts-ignore
    product.images.splice( product.images.indexOf(data.filename) , 1 )
    await product.save()

    await deleteFile(data.filename)

    return res.status(200).json({
      message : 'product updated successfully!',
      product : await Product.findById(id)
    })


  }catch(err){
    return res.status(500).json({
      message: 'Error while editing product',
    });
  }

})

router.post('/edit-product-upload-image' , upload.fields([{ name: 'images', maxCount: 8 }]) , async (req: Request, res: Response) => {

  // @ts-ignore
  const id:string = req.query.id

  if(!id) return res.status(400).json({
    message : 'Please provide product id'
  })

  try{

    const product = await Product.findOne({_id : id});

    if(!product) return res.status(404).json({
      message : 'Product not found!'
    })

    // @ts-ignore
    if (!req.files || !req.files['images']) {
      return res.status(400).json({
        message: 'Please upload product images',
      });
    }
    

    // @ts-ignore
    for(let i = 0; i < req.files['images'].length; i++){
      // @ts-ignore
      product.images.push(req.files['images'][i].filename)
    }

    await product.save()

    return res.status(200).json({
      message : 'product updated successfully!',
      product : await Product.findById(id)
    })
    
  }catch(err){
    return res.status(500).json({
      message: 'Error while editing product' + err,
    });
  }


})


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