import { z } from 'zod';

import type { ModelConfigData } from '@/config/super-admin';

export type ModelUpdate = {
  data: Record<string, unknown>;
  relations: { relationModel: string; relatedIds: string[] }[];
};

const stringArraySchema = z.array(z.string());

export function buildRecordRequest(
  model: ModelConfigData,
  values: Record<string, unknown>
): ModelUpdate {
  const { data, relations } = model.fields.reduce<ModelUpdate>(
    (acc, field) => {
      if (field.type === 'manyRelation' && field.relationModel) {
        // move fields with 'manyRelation' to the relations object
        const fieldValue = values[field.key];
        const { data: valueAsStringArray, success } =
          stringArraySchema.safeParse(fieldValue);
        if (success) {
          acc.relations.push({
            relationModel: field.relationModel,
            relatedIds: valueAsStringArray,
          });
        } else {
          // will only process the relation if the field is an array of strings
          // if the value is null or undefined, probably it means the zod schema doesn't have the field
          throw new Error(
            'Field of type "manyRelation" doesn\'t have a string array value'
          );
        }
      } else {
        acc.data[field.key] = values[field.key];
      }
      return acc;
    },
    { data: {}, relations: [] }
  );
  return {
    data,
    relations,
  };
}
