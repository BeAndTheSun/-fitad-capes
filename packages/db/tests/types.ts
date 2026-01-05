import type { Db } from '@/db/models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockedClassInstance<InstanceType extends Record<string, any>> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key in keyof InstanceType]: InstanceType[key] extends Function
    ? jest.MockedFunction<InstanceType[key]>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      InstanceType[key] extends Record<string, any>
      ? MockedClassInstance<InstanceType[key]>
      : InstanceType[key];
};

export type MockedDb = MockedClassInstance<Db>;
