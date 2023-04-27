import dotenv from "dotenv";
import { Controller } from "tsoa";
import cloudinary from "cloudinary";
import streamifier from "streamifier"
import { InvalidatedProjectKind } from "typescript";
import axios, { AxiosError } from "axios";


dotenv.config();

cloudinary.v2.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUNDINARY_API_SECRET
})


export interface IResponse {
    code : number,

    message ?: string,

    data?: any
}

export class My_Controller extends Controller {


    public validate (schema: any, fields:any) : boolean | object {
        
        const validation  = schema.validate(fields,  { abortEarly: false });
        let errors : any = {};
        if (validation.error){
            for (const field of validation.error.details){
                errors[field.context.key] = field.message
            }
            return errors;
        }else {
            return true
        }
        
    }

    /**
     * 
     * @param file 
     * @returns Array of url for multiple upload file or url for single file upload
     */
    public async uploadFile (file : Express.Multer.File) : Promise<any> {

        if (Array.isArray(file)){
            const urls : any = [];
            for (const item of file){
                const newPath = await this.cloudinaryImageUploadMethod(item)
                console.log("newPath", newPath)
                urls.push(newPath)
            }
            
            return urls
        }else {
           const url = await this.cloudinaryImageUploadMethod(file)
           return url;
        }

    }  

    public async payment(body: any, headers: any, url: string) : Promise<any> {

        await axios.post(url,body,{ headers }).catch((e : AxiosError) => {
            console.log('error is ',e.response)
        })
        return 'res'
    }

    private async cloudinaryImageUploadMethod(file : any) : Promise<any> {

        return new Promise((resolve, rejects) => {

            //Check extension for upload file
            // if(file.mimetype !== ('image/jpg' || 'image/jpeg' || 'image/png')) {
            //     rejects('You must upload jpg, jpeg or png file !');
            // }

            const uploadStream = cloudinary.v2.uploader.upload_stream({
                folder: "foo",
                transformation: [
                    {overlay: "white_iev0tr", width: 550, height: 90, flags: "relative", opacity: 30, gravity: "south_east", x: 5, y: 15},
                    {overlay: "semi_igre3f", width: 500, height:70, gravity: "south_east", x: 20, y: 20, crop: "scale"},
                ]
            },
            (error, result) => {
                if(error){
                    console.log();
                    console.log("** File Upload (Promise)");
                    console.warn(error);
                    rejects(error)
                } else {
                    console.log();
                    console.log("** File Upload (Promise)");
                    console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                    let url = result?.secure_url
                    resolve(url)
                }  
                
            })
            streamifier.createReadStream(file.buffer).pipe(uploadStream)
        })
    }
}
