//import { S3 } from 'aws-sdk';
import * as AWS from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';
import _ from 'lodash';
var cfsign = require('aws-cloudfront-sign');
const s3_path = `./private.pem`
import * as moment from 'moment';

import Config from "./../../config/config"

//AWS.config.loadFromPath('./s3.json')
const BucketName =  Config.s3.bucketName 
let s3 = new AWS.S3({ params: { Bucket: BucketName } });

AWS.config.update({
    accessKeyId: Config.s3.accessKeyId, 
    secretAccessKey: Config.s3.secretAccessKey, 
    region: Config.s3.region 
    // signatureVersion: 'v4',
});

const options = {
    //signatureVersion: 'v4',

    //ACL: 'public-read',
    region: Config.s3.region, 
    endpoint: new AWS.Endpoint(BucketName + '.' + Config.s3.accelerateUrl), useAccelerateEndpoint: true //process.env.ACCELERATEURL //uat changes
}

 s3 = new AWS.S3(options);

@Injectable()

export class FileUploadService {

    

    async upload(file,filePath) {
        //console.log("file",file)
        const { originalname } = file;
        const bucketS3 = BucketName 
        await this.uploadS3(file.buffer, bucketS3,filePath,file.mimetype);
    }

    async uploadS3(file, bucket,filePath,mimetype) {
        //console.log("file",file)
        const s3 = this.getS3();
        const params = {
            Bucket: bucket,
            Key: filePath,
            Body: file,
            ContentType:mimetype,
            //expireTime: moment().add(Number('900'), 'seconds')
        };
        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
            if (err) {
               // console.log("err", err)
               // Logger.error(err);
                reject(err.message);
            }
           // console.log("data", data)  
            resolve(data);
            });
        });
    }

    getS3() {
        return new AWS.S3({
            accessKeyId: Config.s3.accessKeyId, 
            secretAccessKey: Config.s3.secretAccessKey, 
            region: Config.s3.region 
        });
    }

    async deleteImageFromS3(filePath) {
        //console.log("filePath--",filePath)
       // const s3 = this.getS3();
        const params = {
          Bucket: BucketName,
          Key: filePath,
        };
      
        try {
          const data = await s3.deleteObject(params).promise();
          //console.log('Image deleted successfully:', data);
          return true
        } catch (error) {
          //console.error('Error deleting image:', error);
          return false
        }
      }

    async generateAcceleratedUrl(data) {
      let upload =  s3.getSignedUrl('putObject', { Bucket: BucketName, Key: data,Expires: Number('900') })
      return upload
    }

    async generateCloudFrontUrl(path)  {
        if(path != "")
        {
            var signingParams = {
                keypairId: Config.s3.accessKeyId, 
                privateKeyPath: s3_path,
                expireTime: moment().add(Number('900'), 'seconds'),
                ContentType:"image/jpeg",
                // headers: { //--new
                //     //'Access-Control-Allow-Origin': 'https://uatdcms.sparity.com', 
                //     'Content-Disposition': 'inline'
                //   },
            }
            //console.log("ex",moment().add(Number('900'), 'seconds'))
            try {
                let signedUrl = await cfsign.getSignedUrl(
                    Config.s3.cloudfrontUrl + path,  
                    signingParams);
                //  console.log(signedUrl)
                return signedUrl;
            } catch (err) {
                 console.log(err)
                return "";
            }
        }else{
            return ""
        }
       
    
    }
}


