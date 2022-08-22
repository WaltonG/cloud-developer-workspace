import 'source-map-support/register'
import { TodosAccess } from '../dataAccessLayer/todosAcess'
import { fileStorage } from '../fileStorageLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todosAcess = new TodosAccess()
const fileStore = new fileStorage()

const logger = createLogger('todos')

// Get Todos For user function
export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Fetching all Todos for user ${userId}`)
  return await todosAcess.getTodos(userId)
}


// Create Todo function
export async function createTodo( createTodoRequest: CreateTodoRequest, userId: string ): Promise<TodoItem> {
  
  const todoId = uuid.v4()
  logger.info(`Creating Todo: ${todoId} for user: ${userId}`)

  const todo: TodoItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }
  await todosAcess.createTodo(todo)

  return todo
}


// Delete Todo function
export function deleteTodo( todoId: string, userId: string ): Promise<string> {
  logger.info(`Deleting TODO item: ${todoId} for User: ${userId}`)
  return todosAcess.deleteTodo(todoId, userId)
}


// Update Todo function
export function updateTodo( todoId:string, updatedTodo:UpdateTodoRequest, userId:string ): Promise<any> {

  logger.info(`Updating TODO item ${todoId} for userId: ${userId}`)

  return todosAcess.updateTodo(todoId, updatedTodo as TodoUpdate, userId)
}

// Get Presigned Url for s3 bucket
export async function generateUploadUrl(attachmentId:string): Promise<string> {
  logger.info("Generating PreSigned Url")
  const presignedUrl = await fileStore.generateUrl(attachmentId)

  return presignedUrl
}

// Update Attachmenturl
export async function updateAttachmentUrl(userId:string, todoId:string, attachmentId: string): Promise<any> {
  logger.info(`Updating attachment Url for User: ${userId} with Todo ID: ${todoId}`);
  const attachmentUrl = await fileStore.getAttachmentUrl(attachmentId);
  return await todosAcess.updateAttachmentUrl(todoId, attachmentUrl, userId)
}