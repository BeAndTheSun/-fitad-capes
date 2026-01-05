import { z } from 'zod';

export type BuildNumberZodSchemaProps = {
  isInteger?: boolean;
  min?: number;
  max?: number;
  errorMessages?: {
    isNumber?: string;
    isInteger?: string;
    min?: string;
    max?: string;
  };
};

/**
 * Used as a zod validation template for number inputs.
 */
export const buildNumberZodSchema = ({
  isInteger,
  min,
  max,
  errorMessages,
}: BuildNumberZodSchemaProps = {}): z.ZodPipeline<z.ZodString, z.ZodNumber> => {
  const DEFAULT_NUMBER_MESSAGE = 'Value must be a valid number';
  let innerSchema = z.coerce.number({
    message: errorMessages?.isNumber || DEFAULT_NUMBER_MESSAGE,
  });
  if (isInteger) {
    innerSchema = innerSchema.int(
      errorMessages?.isInteger || 'Value must be an integer'
    );
  }
  if (min != null) {
    innerSchema = innerSchema.min(
      min,
      errorMessages?.min || `Value must be greater than ${min}`
    );
  }
  if (max != null) {
    innerSchema = innerSchema.max(
      max,
      errorMessages?.max || `Value must be less than ${max}`
    );
  }
  return z
    .string({
      message: errorMessages?.isNumber || DEFAULT_NUMBER_MESSAGE,
    })
    .min(1, errorMessages?.isNumber || DEFAULT_NUMBER_MESSAGE)
    .pipe(innerSchema);
};

// Helper function to add min(1) validation to non-nullable, non-optional strings
export function addMinLengthValidationToRequiredStrings<
  Schema extends z.AnyZodObject,
>(schema: Schema): Schema {
  const newShape = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.entries(schema.shape).map(([key, field]) => {
      if (
        field instanceof z.ZodString &&
        !(field instanceof z.ZodOptional) &&
        !(field instanceof z.ZodNullable)
      ) {
        // Add min(1) validation with a custom message
        return [key, field.min(1, { message: `${key} is required` })];
      }
      return [key, field];
    })
  ) as unknown as z.ZodRawShape;

  return z.object(newShape) as Schema;
}
