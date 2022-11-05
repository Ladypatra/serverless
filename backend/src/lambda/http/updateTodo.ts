import 'source-map-support/register';
import { cors , httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { updateTodo } from '../../businessLogic/todos';
import { TodoUpdate } from '../../models/Todo.d';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';

const logger = createLogger('updateTodo');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing UpdateTodo event...');
  const jwtToken: string = getToken(event);
  const todoId = event.pathParameters.todoId;
  const updateData: TodoUpdate = JSON.parse(event.body);

  try {
    await updateTodo(jwtToken, todoId, updateData);
    logger.info(`Successfully updated the todo item: ${todoId}`);
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