import { TodosAccess } from '../dataLayer/todosAccess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';
// import * as createError from 'http-errors';

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess');
const attachmentUtils = new AttachmentUtils();
const todosAccess = new TodosAccess();

export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Create todo');

  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();
  // const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    // attachmentUrl: s3AttachmentUrl,
    ...newTodo
  };

  return await todosAccess.createTodoItem(newItem);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Get todo for user');
  return todosAccess.getTodosForUser(userId);
}

export async function updateTodo(
  userId: string,
  todoId: string,
  todoUpdate: UpdateTodoRequest
): Promise<UpdateTodoRequest> {
  logger.info('Update todo');
  return await todosAccess.updateTodo(userId, todoId, todoUpdate);
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<TodoItem> {
  logger.info('Delete todo');
  return todosAccess.deleteTodo(userId, todoId);
}

export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  logger.info('Create attachment todo');
  const uploadUrl = await attachmentUtils.getUploadUrl(todoId);
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
  await todosAccess.updateTodoAttachmentUrl(userId, todoId, s3AttachmentUrl);
  // return attachmentUtils.getUploadUrl(todoId);
  return uploadUrl;
}

export async function searchTodos(
  userId: string,
  keyword: string
): Promise<TodoItem[]> {
  return todosAccess.searchTodos(userId, keyword);
}