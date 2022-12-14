import 'source-map-support/register';
import { cors, httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { deleteTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';

const logger = createLogger('deleteTodo');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing DeleteTodo event...');
  const jwtToken: string = getToken(event);
  const todoId = event.pathParameters.todoId;

  try {
    await deleteTodo(jwtToken, todoId);
    logger.info(`Successfully deleted todo item: ${todoId}`);
    return {
      statusCode: 204,
      body: undefined
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
