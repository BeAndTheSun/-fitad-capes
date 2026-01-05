import { useGetModelRelations } from '@meltstudio/client-common';

import type { ModelConfigData } from '@/config/super-admin';
import type { FieldData } from '@/ui/form-hook-helper';
import { convertFieldListToFormFieldList } from '@/utils/convert-field-list-to-form-field-list';

export function useRelationsByModel(model: ModelConfigData): FieldData[] {
  const relationNames: string[] = model.fields
    .filter((field) => !!field.relationModel)
    .map((field) => field.relationModel as string);
  const relations = useGetModelRelations({
    model: model.name,
    relations: relationNames,
  });

  const fieldsWithRelations = model.fields.map((field) => {
    if (!field.relationModel) return field;
    const index = relationNames.indexOf(field.relationModel);
    if (index === -1) return field;
    const { data, error, isLoading } = relations[index] || {};
    if (isLoading) return field;

    // TODO: handle better the error, so it will show an error screen if the query fails
    if (error) return field;
    return {
      ...field,
      options: data?.map(({ id, label }) => ({ value: id, label })) || [],
    };
  });

  return convertFieldListToFormFieldList(fieldsWithRelations);
}
