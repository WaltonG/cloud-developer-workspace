import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as uuid from 'uuid'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info("Generating presigned url")

    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    const presignedUrl = await generateUploadUrl(attachmentId)
    
    await updateAttachmentUrl(userId, todoId, attachmentId)
    
    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        "uploadUrl": presignedUrl
      })
    }
  }
