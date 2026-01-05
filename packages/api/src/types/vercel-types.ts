import z from 'zod';

// EventTypes
const EventTypes = {
  generateClientToken: 'blob.generate-client-token',
  uploadCompleted: 'blob.upload-completed',
} as const;

// GenerateClientTokenEvent
const generateClientTokenEventSchema = z.object({
  type: z.literal(EventTypes.generateClientToken),
  payload: z.object({
    pathname: z.string(),
    callbackUrl: z.string(),
    multipart: z.boolean(),
    clientPayload: z.string().nullable(),
  }),
});

// PutBlobResult
const putBlobResultSchema = z.object({
  url: z.string(),
  downloadUrl: z.string(),
  pathname: z.string(),
  contentType: z.string().optional(),
  contentDisposition: z.string(),
});

// UploadCompletedEvent
const uploadCompletedEventSchema = z.object({
  type: z.literal(EventTypes.uploadCompleted),
  payload: z.object({
    blob: putBlobResultSchema,
    tokenPayload: z.string().nullable().optional(),
  }),
});

// UploadBodyType
export const uploadFilveVercelBodySchema = z.discriminatedUnion('type', [
  generateClientTokenEventSchema,
  uploadCompletedEventSchema,
]);

export const uploadFileVercelResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('blob.generate-client-token'),
    clientToken: z.string(),
  }),
  z.object({
    type: z.literal('blob.upload-completed'),
    response: z.string(),
  }),
]);
