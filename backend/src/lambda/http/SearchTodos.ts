import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { searchTodos } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { SearchTodoRequest } from '../../requests/SearchTodoRequest';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    const request: SearchTodoRequest = JSON.parse(event.body);
    const tasks = await searchTodos(userId, request.keyword);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: tasks
      })
    };
  }
);

handler.use(
  cors({
    credentials: true
  })
);
