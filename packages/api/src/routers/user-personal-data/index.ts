import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { addPersonalInfo } from '@/api/services/personal-info';

import { userPersonalDataApiDef } from './def';

export const userPersonalDataRouter = ctx.router(userPersonalDataApiDef);

userPersonalDataRouter.get('/:userId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { userId } = req.params;

  const user = await db.userPersonalData.getUserPersonalData(userId);
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  return res.status(200).json({
    fullName: user.full_name,
    phoneNumber: user.phone_number,
    fitnessGoal: user.fitness_goal,
    sponsoring: user.sponsoring,
  });
});

userPersonalDataRouter.post('/:userId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({ error: 'User ID is required' });
  }

  const { fullName, phoneNumber, fitnessGoal, sponsoring } = req.body;

  if (!fullName || !phoneNumber || !fitnessGoal || !sponsoring) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    await addPersonalInfo({
      userId,
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        fitness_goal: fitnessGoal,
        sponsoring,
      },
    });

    return res.status(200).json({
      fullName,
      phoneNumber,
      fitnessGoal,
      sponsoring,
    });
  } catch (error) {
    return res.status(500).send({ error: 'Failed to add personal info' });
  }
});
