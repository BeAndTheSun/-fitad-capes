import type {
  ModelConfigField,
  ModelConfigFieldType,
} from '@/config/super-admin';
import type {
  FieldCheckboxMode,
  FieldData,
  FieldDataType,
} from '@/ui/form-hook-helper';

export function convertFieldListToFormFieldList(
  fields: ModelConfigField[]
): FieldData[] {
  return fields
    .filter((field) => field.type !== 'ID')
    .map((field) => {
      let newType: FieldDataType = 'text';
      const oldType = field.type as Exclude<ModelConfigFieldType, 'ID'>;
      let checkboxMode: FieldCheckboxMode | undefined;
      if (oldType === 'boolean') {
        newType = 'checkbox';
        checkboxMode = 'boolean';
      } else if (oldType === 'email') {
        newType = 'text';
      } else if (oldType === 'relation') {
        newType = 'select';
      } else if (oldType === 'manyRelation') {
        newType = 'multiselect';
      } else {
        newType = oldType;
      }
      return {
        label: field.label,
        name: field.key,
        options: field.options,
        size: field.size,
        type: newType,
        checkboxMode,
        required: true,
      };
    });
}
