import { useRouter } from 'next/router';

import type { ModelConfigData } from '@/config/super-admin';
import { modelsConfig } from '@/config/super-admin';
import { kebabToCamel } from '@/utils/kebab-to-camel';

export type UseModelByRouteReturn = {
  modelName: string;
  model: ModelConfigData | undefined;
  isReady: boolean;
  indexName: string;
};

export function useModelByRoute(): UseModelByRouteReturn {
  const router = useRouter();
  const { model: modelNameQuery } = router.query;
  const modelData: UseModelByRouteReturn = {
    modelName: '',
    model: undefined,
    isReady: router.isReady,
    indexName: '',
  };
  // Ensure we have a valid model
  if (typeof modelNameQuery !== 'string') {
    return modelData;
  }
  const camelModelName = kebabToCamel(modelNameQuery);
  const selectedModel = modelsConfig[camelModelName];
  if (!selectedModel || typeof selectedModel !== 'object') {
    return modelData;
  }
  return {
    modelName: camelModelName,
    model: selectedModel,
    isReady: router.isReady,
    indexName: selectedModel.indexName || '',
  };
}
