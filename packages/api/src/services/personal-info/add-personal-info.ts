import { db } from '@/api/db';

type AddPersonalInfoData = {
  id?: string;
  full_name: string | null;
  phone_number: string | null;
  fitness_goal: string | null;
  sponsoring: string | null;
  created_at?: Date;
  updated_at?: Date;
};

type AddPersonalInfoParams = {
  userId: string;
  data: AddPersonalInfoData;
};

export const addPersonalInfo = async ({
  userId,
  data,
}: AddPersonalInfoParams): Promise<{
  updated: boolean;
  data: AddPersonalInfoData;
}> => {
  const existing = await db.userPersonalData.getUserPersonalData(userId);

  if (existing) {
    const result = await db.userPersonalData.update({
      pk: existing.id,
      data,
    });
    return { updated: true, data: result };
  }

  const result = await db.userPersonalData.create({
    data: {
      userId,
      ...data,
    },
  });
  return { updated: false, data: result };
};
