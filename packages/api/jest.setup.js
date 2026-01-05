process.env.AWS_ACCESS_KEY_ID = 'fakeAccessKeyId';
process.env.AWS_SECRET_ACCESS_KEY = 'fakeSecretAccessKey';
process.env.AWS_REGION = 'fakeRegion';
process.env.BUCKET_NAME = 'fakeBucketName';
process.env.AWS_ENDPOINT = 'http://localhost:4566';
process.env.BLOB_READ_WRITE_TOKEN = 'TOKEN_READ_WRITE_asdfghjk_PRIVATE';
// default storage provider for test is aws
// to change it per test change it at top of the test file (example here: \packages\api\tests\storage-vercel\get-file.spec.ts)
process.env.NEXT_PUBLIC_FILE_STORAGE_PROVIDER = 'aws';
process.env.FILE_STORAGE_PROVIDER = 'aws';
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'fakeOpenAiApiKey';
process.env.OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/test_db';
process.env.AWS_DYNAMO_DB_TABLE_NAME = 'mock-ddb-table-name';
