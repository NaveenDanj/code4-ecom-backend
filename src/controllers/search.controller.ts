import express, {Request, Response} from 'express';
import Product from '../models/product.model';
const router = express.Router();


router.get('/product-search' , async(req:Request , res:Response) => {

    // @ts-ignore
  const searchQueryString:string = req.query.q

  if(!searchQueryString) return res.status(400).json({
    message : 'Please provide search query'
  })


  const searchQuery = {
    $or: [
      { productName: { $regex: searchQueryString, $options: 'i' } }, // Case-insensitive search on productName
      { description: { $regex: searchQueryString, $options: 'i' } }, // Case-insensitive search on description
    ],
  };

  try {
    const matchingProducts = await Product.find(searchQuery).limit(5);

    return res.json({
      results: matchingProducts,
    });

  } catch (error) {

    return res.status(500).json({
      message: 'Internal Server Error',
      error: error,
    });
 
  }

})


export default router;