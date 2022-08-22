import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('attachmentUtils')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic
export class fileStorage {
  constructor(
    private readonly s3Object = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET,
    private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}
    
  async getAttachmentUrl(attachmentId:string): Promise<string> {
    logger.info("Getting attachment Url!")

    const attachmentUrl =  `https://${this.attachmentS3Bucket}.s3.amazonaws.com/${attachmentId}`
    
    return attachmentUrl
  }

  async generateUrl(attachmentId:string): Promise<string> {
    logger.info("Creating attachment Url!")

    const uri = this.s3Object.getSignedUrl('putObject', {
      Bucket: this.attachmentS3Bucket,
      Key: attachmentId,
      Expires: parseInt(this.signedUrlExpiration) || 500
    })
    return uri
  }
}
