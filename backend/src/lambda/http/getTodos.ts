import 'source-map-support/register';
import { cors, httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { getTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';
import { TodoItem } from '../../models/Todo.d';

const logger = createLogger('getTodos');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing GetTodos event...');
  const jwtToken: string = getToken(event)

  try {
    const todoList: TodoItem[] = await getTodos(jwtToken);
    logger.info('Successfully retrieved todolist');
    return {
      statusCode: 200,
      body: JSON.stringify({ data: todoList })
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
