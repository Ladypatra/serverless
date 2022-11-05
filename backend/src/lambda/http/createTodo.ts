import 'source-map-support/register'
import { cors, httpErrorHandler } from 'middy/middlewares'
import middy from 'middy';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../../utils/getJwt';
import { TodoCreate, TodoItem } from '../../models/Todo.d';

const logger = createLogger('createTodo');

export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing CreateTodo event...')
  const jwtToken: string = getToken(event)
  const newTodoData: TodoCreate = JSON.parse(event.body)

  try {
    const newTodo: TodoItem = await createTodo(jwtToken, newTodoData);
    logger.info('Successfully created a new todo item.');
    return {
      statusCode: 201,
      body: JSON.stringify({ item: newTodo })
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
