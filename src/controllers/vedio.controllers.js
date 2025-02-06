import {asyncHandler} from '../middlewares/asyncHandler.js';
import {Vedio} from '../models/vedio.models.js';
import { ApiError } from '../utils/ApiError.js';

const uploadVedio = asyncHandler(async (req, res) => {

    
    //get the title and description from the request body
    const {title,description} = req.body;



    //check if the title and description is provided
    if(!title || !description){
        throw new ApiError(400, 'Please provide title and description');
    }


    //get the vedio file from the request
    const vedioFile = req.files.vedio;


   //check if the vedio file is provided
    if(!vedioFile){
        throw new ApiError(400, 'Please provide vedio file');
    }

});