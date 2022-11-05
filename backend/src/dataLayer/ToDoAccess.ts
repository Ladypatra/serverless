import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem, TodoUpdate } from '../models/Todo.d';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess');

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  logger.info(`Creating new todo item: ${todo.todoId}`);
  await docClient
    .put({
      TableName: todosTable,
      Item: todo
    })
    .promise()
  return todo
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todo items');
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise();
  return result.Items as TodoItem[];
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  logger.info(`Getting todo item: ${todoId}`);
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    })
    .promise();
  const todoItem = result.Items[0];
  return todoItem as TodoItem;
}

export async function updateTodo(userId: string, todoId: string, updateData: TodoUpdate): Promise<void> {
  logger.info(`Updating a todo item: ${todoId}`);
  await docClient
    .update({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
      ExpressionAttributeNames: { '#n': 'name' },
      ExpressionAttributeValues: {
        ':n': updateData.name,
        ':due': updateData.dueDate,
        ':dn': updateData.done
      }
    })
    .promise();
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  await docClient
    .delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
    .promise();
}

export async function saveImgUrl(userId: string, todoId: string, bucketName: string): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: { userId, todoId },
      ConditionExpression: 'attribute_exists(todoId)',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
      }
    })
    .promise();
}