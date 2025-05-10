import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import path from "path";


// Global AWS SDK config
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
  });
const s3 = new AWS.S3();

export const uploadFileToS3 = async (file: Express.Multer.File, folder: string) => {
  const fileExtension = path.extname(file.originalname);
  const key = `${folder}/${uuid()}${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  await s3.upload(params).promise();

  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
