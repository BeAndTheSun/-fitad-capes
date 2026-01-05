import { fakeUserExtended, fakeWorkspace } from '@meltstudio/db/tests';
import request from 'supertest';
import { mockedDb, mockedServerSession } from 'tests/utils';

import { app } from '@/api/index';

enum QueryType {
  USERS_OVER_TIME = 'USERS_OVER_TIME',
}

describe('POST /', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if the user is not authenticated', async () => {
    mockedServerSession.mockReturnValue(null);
    const workspace = fakeWorkspace();
    const response = await request(app).post('/api/metrics/').send({
      metric: QueryType.USERS_OVER_TIME,
      workspaceId: workspace.id,
    });

    expect(response.status).toBe(401);
  });

  it('should return data for the USERS_OVER_TIME metric', async () => {
    const user = fakeUserExtended();
    mockedServerSession.mockReturnValue({
      user: { email: user.email, id: user.id },
    });
    mockedDb.user.findUniqueByEmail.mockResolvedValue(user);
    const workspace = fakeWorkspace();
    const mockData = [{ date: '2023-01-01', users: 10 }];
    mockedDb.user.getUsersOverTime = jest.fn().mockResolvedValue(mockData);

    const response = await request(app)
      .post('/api/metrics')
      .set('Authorization', 'Bearer test-token')
      .send({
        metric: QueryType.USERS_OVER_TIME,
        workspaceId: workspace.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
    expect(mockedDb.user.getUsersOverTime).toHaveBeenCalledWith(workspace.id);
  });

  it('should return an error if an unknown metric is sent', async () => {
    const user = fakeUserExtended();
    mockedServerSession.mockReturnValue({
      user: { email: user.email, id: user.id },
    });
    mockedDb.user.findUniqueByEmail.mockResolvedValue(user);
    const workspace = fakeWorkspace();
    const response = await request(app)
      .post('/api/metrics')
      .set('Authorization', 'Bearer test-token')
      .send({ metric: 'UNKNOWN_METRIC', workspaceId: workspace.id });

    expect(response.status).toBe(400);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_enum_value',
          message:
            "Invalid enum value. Expected 'USERS_OVER_TIME' | 'WORKSPACES_OVER_TIME', received 'UNKNOWN_METRIC'",
          options: ['USERS_OVER_TIME', 'WORKSPACES_OVER_TIME'],
          path: ['metric'],
          received: 'UNKNOWN_METRIC',
        }),
      ])
    );
  });
});
