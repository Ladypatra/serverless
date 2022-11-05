import 'source-map-support/register';
import { cors, httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { getTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';
import { TodoItem } from '../../models/Todo.d';

const logger = createLogger('getTodo');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing GetTodo event...');
  const jwtToken: string = getToken(event);
  const todoId = event.pathParameters.todoId

  try {
    const todoItem: TodoItem = await getTodo(jwtToken, todoId);
    logger.info(`Successfully retrieved todo item: ${todoId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ data: todoItem })
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
