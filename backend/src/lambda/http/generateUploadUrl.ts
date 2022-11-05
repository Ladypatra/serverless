import 'source-map-support/register';
import { cors, httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { generateUploadUrl } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';

const logger = createLogger('GenerateUploadUrl');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing GenerateUploadUrl event...');
  const jwtToken: string = getToken(event);
  const todoId = event.pathParameters.todoId;

  try {
    const signedUrl: string = await generateUploadUrl(jwtToken, todoId);
    logger.info('Successfully created signed url.');
    return {
      statusCode: 201,
      body: JSON.stringify({ uploadUrl: signedUrl })
    };
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error })
    };
  }
})

handler
 .use(httpErrorHandler())
 .use(
     cors({
       credentials: true
  })
)
