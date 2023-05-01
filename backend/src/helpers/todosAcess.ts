import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.INDEX_NAME
  ) {}

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos for user');

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Create todo');

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise();

    return todoItem as TodoItem;
  }

  async updateTodo(
    userId: string,
    todoId: string,
    updatedTodo: TodoUpdate
  ): Promise<TodoItem> {
    logger.info(`Updating todo ${todoId}`);

    let params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      },
      ReturnValues: 'ALL_NEW'
    };
    const result = await this.docClient.update(params).promise();
    const item = result.Attributes;
    return item as TodoItem;
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    logger.info(`Deleting todo ${todoId}`);

    let params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    };
    const result = await this.docClient.delete(params).promise();
    const item = result.Attributes;
    return item as TodoItem;
  }

  async updateTodoAttachmentUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem> {
    console.log('Updating attachment url');

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await this.docClient.update(params).promise();
    const item = result.Attributes;
    return item as TodoItem;
  }

  async searchTodos(userId: string, keyword: string): Promise<TodoItem[]> {
    console.log('Getting all todo for user ', userId, ' by keyword ', keyword);

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: '#userId =:i',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':i': userId
        }
      })
      .promise();

    let items = result.Items;
    items = items.filter((item) => item.name.includes(keyword));
    return items as TodoItem[];
  }
}