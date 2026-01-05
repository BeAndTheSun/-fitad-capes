# Task Runner with AWS Lambda and DynamoDB

This project implements a task runner using AWS Lambda and DynamoDB. When a new
task is inserted into the DynamoDB table, a DynamoDB stream triggers an AWS
Lambda function. The Lambda function processes tasks based on the specified task
type, updating task statuses in DynamoDB as it proceeds.

## Table of Contents

- [Features](#features)
- [Project Structure](#structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [How it works](#how-it-works)
- [Example](#example)
- [Adding a New Task](#adding-a-new-task)
- [Logging](#logging)
- [Testing](#testing)

## Features

- **DynamoDB Task Queue**: Insert a task entry into DynamoDB to trigger
  processing.
- **AWS Lambda Trigger**: A DynamoDB Stream initiates a Lambda function upon
  task insertion.
- **Task Processing**: Lambda identifies and processes each task type, updating
  statuses as it completes or fails.
- **Modular Task Handling**: Easily add new task types and define specific
  handling methods.

## Structure

- `index.ts`: Lambda handler that listens to DynamoDB events and initiates task
  processing.
- `runner.ts`: Core logic for handling tasks, including updating task statuses.
- `tasks/*`: Folder containing individual task implementations. (`example.ts` is
  an example task function)
- `config/*`: Configuration for DynamoDB and AWS region setup.
- `types/*`: Types related to the task runner.

## Setup and Installation

1. **Install Dependencies**  
   Make sure you have Node.js and AWS CLI configured:

   ```shell
   yarn install
   ```

2. **Environment Configuration**  
   Configure your environment variables as outlined below.

3. **AWS IAM Roles**  
   Ensure your AWS Lambda function has permissions to access DynamoDB with read
   and write permissions and CloudWatch Logs for logging purposes.

## Environment Variables

Set the following environment variables in your deployment environment:

- `AWS_DYNAMO_DB_TABLE_NAME`: Name of the DynamoDB table where tasks are
  inserted.
- `AWS_REGION`: AWS region for your DynamoDB and Lambda resources.

## How it works

1. **Task Insertion**:  
   Insert a new task into the DynamoDB table with a status of `PENDING`. The
   `DynamoDBStreamEvent` will trigger the Lambda function to start processing.

2. **Lambda Function Execution**:  
   When triggered, the Lambda function filters for `INSERT` events, extracts
   relevant task data, and initializes the `TaskRunner` to process each task.

3. **Task Processing**:  
   Depending on the task type, the `TaskRunner` executes the specific task
   handler function, updates task status to `PROCESSING` during execution, and
   updates to `DONE` upon success or `FAILED` if an error occurs.

## Example

The example task (`exampleAsyncFunction`) in `tasks/example.ts` validates
incoming data and logs a message after a 1-second delay. Additional tasks can be
added to the `tasks` folder and specified in `TaskRunner`.

```ts
export const exampleAsyncFunction: TaskFunction = async (data) => {
  const parsedData = ExampleAsyncFunctionDataSchema.safeParse(data);
  if (!parsedData.success) return { error: 'Invalid data' };

  const { message } = parsedData.data;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  logger.info(`Function Triggered | Message: ${message}`);
  return { error: null };
};
```

## Adding a New Task

To add a new task to the task runner, follow these steps:

### 1. Create a Task File

Create a new file in the `tasks` directory for your task. For example, create
`tasks/newTask.ts`:

```ts
import type { TaskFunction } from '@meltstudio/types';
import { z } from 'zod';
import { logger } from '@/task-runner/logger';

const NewTaskDataSchema = z.object({
  message: z.string().min(1),
});

export const newTaskFunction: TaskFunction = async (data) => {
  const parsedData = NewTaskDataSchema.safeParse(data);
  if (!parsedData.success) return { error: 'Invalid data' };

  const { message } = parsedData.data;
  logger.info(`New Task Triggered | Message: ${message}`);

  // Add task logic here...

  return { error: null };
};
```

### 2. Update the Task Type Enum

Ensure the new task type is included in the task type enum (in
`@meltstudio/types`). For example:

```ts
export enum TaskType {
  EXAMPLE_TASK = 'EXAMPLE_TASK',
  NEW_TASK = 'NEW_TASK', // Add your new task type here
}
```

### 3. Link the Task in `tasks/index.ts`

In the corresponding tasks `index.ts`, import the new task function:

```ts
export const AsyncTasks: Record<TaskType, TaskFunction> = {
  EXAMPLE_TASK: exampleAsyncFunction,
  NEW_TASK: newTaskFunction,
};
```

### 5. Creating a New Task Record

To create a new task record in DynamoDB, use the `TaskRunnerClient` class.
Here’s how to use it in your application:

```ts
import { TaskRunnerClient } from '@/tasks/client';
import { TaskType } from '@meltstudio/types';

const taskRunnerClient = TaskRunnerClient.getInstance();

// Example of creating a new task
await taskRunnerClient.createTask(TaskType.NEW_TASK, {
  message: 'Hello, World!',
});
```

This will insert a new task into the DynamoDB table with a status of `PENDING`,
triggering the Lambda function for processing.

## CLI

The Command Line Interface (CLI) allows you to interact with the task runner
directly from the terminal. It provides commands for processing tasks and
creating new ones.

### Commands

- `run-task --task-id <taskId>`: Retrieves and processes a task based on its ID
  from the DynamoDB table.
- `create-task`: Parent command for other task-related commands.
  - `example-task --message <message>`: Creates a new example task with the
    specified message.
  - `export-db --email <email>`: Initiates a database export task and sends the
    results to the specified email address.
  - _Additional tasks may be added in the future._

### Example

To create a new example task, you can use the following command:

```shell
# If running from the app root folder
yarn cli create-task example-task --message "Hello, World!"

# If running from the repo root folder
yarn task-runner:cli create-task example-task --message "Hello, World!"
```

After creating the task, retrieve its ID (e.g., `abc123`) to run it. Use the
following command:

```shell
# If running from the app root folder
yarn cli run-task --task-id "abc123"

# If running from the repo root folder
yarn task-runner:cli run-task --task-id "abc123"
```

## Logging

The project uses structured logging (Pino) to output task execution details. For
each task:

- **Success**: Logs task completion.
- **Failure**: Logs error details, updates task status to `FAILED`, and retries
  as configured.

## Testing

Tests are written using Jest. Run tests with:

```shell
yarn test
```

or

```shell
yarn test:coverage
```
