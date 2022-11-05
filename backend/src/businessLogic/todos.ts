import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import { 
  createTodo as create, 
  getTodos as gets, 
  getTodo as get, 
  updateTodo as update, 
  deleteTodo as del, 
  saveImgUrl } from '../dataLayer/todoAccess';
import { getUserId } from '../utils/getJwt';
import { TodoItem, TodoCreate, TodoUpdate } from '../models/Todo.d';

export async function getTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId: string = getUserId(jwtToken);
  return gets(userId);
}

export async function getTodo(jwtToken: string, todoId: string): Promise<TodoItem> {
  const userId: string = getUserId(jwtToken);
  return get(userId, todoId);
}

export async function createTodo(jwtToken: string, newTodoData: TodoCreate): Promise<TodoItem> {
  const todoId = uuid.v4();
  const userId = getUserId(jwtToken);
  const createdAt = new Date().toISOString();
  const done = false;
  const newTodo: TodoItem = { todoId, userId, createdAt, done, ...newTodoData };
  return create(newTodo);
}

export async function updateTodo(
  jwtToken: string,
  todoId: string,
  updateData: TodoUpdate
): Promise<void> {
  const userId = getUserId(jwtToken);
  return update(userId, todoId, updateData);
}

export async function deleteTodo(jwtToken: string, todoId: string): Promise<void> {
  const userId = getUserId(jwtToken);
  return del(userId, todoId);
}

export async function generateUploadUrl(jwtToken: string, todoId: string): Promise<string> {
  const userId = getUserId(jwtToken);
  const bucketName = process.env.IMAGES_S3_BUCKET;
  const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
  const s3 = new AWS.S3({ signatureVersion: 'v4' });
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
  await saveImgUrl(userId, todoId, bucketName);
  return signedUrl;
}
