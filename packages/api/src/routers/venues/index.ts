import { UserRoleEnum } from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import { updateVenueSchema } from '@/api/schemas/venues';
import type { DbVenueExtended, DbVenueUserWithRelations } from '@/db/schema';

import { venuesApi } from './def';

/**
 * Validates check-in prerequisites for a venue
 * @returns Object containing venue and venueUser if valid, or error object with status and message
 */
async function validateCheckInPrerequisites(
  token: string,
  userId: string
): Promise<
  | { error: true; status: number; message: string }
  | {
      error: false;
      venue: DbVenueExtended;
      venueUser: DbVenueUserWithRelations;
    }
> {
  // Find venue by checking token
  const venue = await db.venue.findByCheckingToken(token);

  if (!venue) {
    return {
      error: true,
      status: 404,
      message: 'Invalid check-in code',
    } as const;
  }

  // Check if venue is active
  if (!venue.isActive) {
    return {
      error: true,
      status: 400,
      message: 'This venue is not currently active',
    } as const;
  }

  // Get user's current status in venue
  const venueUser = await db.venueUsers.findByUserAndVenue(userId, venue.id);

  if (!venueUser) {
    return {
      error: true,
      status: 400,
      message: 'You must join this venue before checking in',
    } as const;
  }

  // Check if user status is 'joined'
  if (venueUser.status !== 'joined') {
    if (venueUser.status === 'checking') {
      return {
        error: true,
        status: 400,
        message: 'You have already checked in to this venue',
      } as const;
    }
    return {
      error: true,
      status: 400,
      message: `Cannot check in with current status: ${venueUser.status}`,
    } as const;
  }

  // All validations passed
  return {
    error: false,
    venue,
    venueUser,
  } as const;
}

export const venuesRouter = ctx.router(venuesApi);

venuesRouter.get('/:workspaceId/list', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const {
    search,
    pageIndex = 0,
    pageSize = 10,
    isActive,
  } = req.query as {
    search?: string;
    pageIndex?: string;
    pageSize?: string;
    isActive?: string;
  };

  const result = await db.venue.findAllVenues({
    filters: {
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    },
    pagination: {
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    },
  });

  return res.status(200).json(result);
});

venuesRouter.get('/:workspaceId/my-venues', async (req, res) => {
  // Auth
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const {
    search,
    pageIndex = 0,
    pageSize = 10,
    isActive,
  } = req.query as {
    search?: string;
    pageIndex?: string;
    pageSize?: string;
    isActive?: string;
  };
  const userId = req.auth.user.id;

  const result = await db.venue.findVenuesByUserId({
    userId,
    filters: {
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    },
    pagination: {
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    },
  });

  return res.status(200).json(result);
});

// Generate venue invitation token
venuesRouter.post(
  '/:workspaceId/venues/:venueId/generate-invitation',
  async (req, res) => {
    // Auth check
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { workspaceId, venueId } = req.params;
    const userId = req.auth.user.id;

    const venue = await db.venue.findUniqueByPk(venueId);
    if (!venue) {
      return res.sendStatus(404);
    }

    if (!venue.isActive) {
      return res.status(403).send({
        error: 'Cannot generate QR code for inactive venue',
      });
    }

    // Check if user is admin/trainer in the workspace
    const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
      userId,
      workspaceId
    );

    if (
      !userWorkspace ||
      ((userWorkspace.role as UserRoleEnum) !== UserRoleEnum.ADMIN &&
        (userWorkspace.role as UserRoleEnum) !== UserRoleEnum.VENUE_OWNER)
    ) {
      return res.status(403).send({
        error: 'Forbidden - Only trainers and admins can generate invitations',
      });
    }

    // Generate or get existing token
    const token = await db.venue.generateInvitationToken(venueId);

    // Build invitation URL with workspaceId
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/venues/invitation/${token}?workspaceId=${workspaceId}`;

    return res.status(200).json({
      token,
      invitationUrl,
    });
  }
);

// Validate venue invitation
venuesRouter.get('/invitation/:token/validate', async (req, res) => {
  const { token } = req.params;
  const { workspaceId } = req.query;

  // Find venue by token
  const venue = await db.venue.findByInvitationToken(token);

  if (!venue) {
    return res.status(404).send({
      error: 'Invalid or expired invitation token',
    });
  }

  // Get workspace information if workspaceId is provided
  let workspace = null;
  let workspaceTrainer = null;

  if (workspaceId && typeof workspaceId === 'string') {
    workspace = await db.workspace.findUniqueByPk(workspaceId);

    if (workspace) {
      workspaceTrainer =
        await db.userWorkspaces.findFirstTrainerByWorkspaceId(workspaceId);
    }
  }

  // Get trainer info (workspace trainer takes precedence over venue owner)
  const trainer = workspaceTrainer || venue.owner || null;

  return res.status(200).json({
    venue: {
      ...venue,
      workspaceId: undefined,
    },
    trainer,
    workspace: workspace
      ? {
          id: workspace.id,
          name: workspace.name,
        }
      : null,
    workspaceId: workspaceId || '',
  });
});

// Accept venue invitation
venuesRouter.post('/invitation/:token/accept', async (req, res) => {
  // Auth check
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { token } = req.params;
  const { workspaceId } = req.body; // Workspace ID should be sent from frontend
  const userId = req.auth.user.id;

  // Validate workspaceId is provided
  if (!workspaceId) {
    return res.status(400).send({
      error: 'Workspace ID is required',
    });
  }

  // Find venue by token
  const venue = await db.venue.findByInvitationToken(token);

  if (!venue) {
    return res.status(404).send({
      error: 'Invalid invitation token',
    });
  }

  // Check if venue is active
  if (!venue.isActive) {
    return res.status(403).send({
      error: 'Cannot join inactive venue',
    });
  }

  // Check if user is already in the venue
  const isAlreadyMember = await db.venueUsers.isUserInVenue(userId, venue.id);

  if (isAlreadyMember) {
    return res.status(403).send({
      error: 'You are already a member of this venue',
    });
  }

  // Check if user belongs to the workspace
  const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
    userId,
    workspaceId
  );

  // If user doesn't belong to workspace, add them as a MEMBER (super participant)
  if (!userWorkspace) {
    await db.userWorkspaces.create({
      data: {
        userId,
        workspaceId,
        role: UserRoleEnum.MEMBER,
      },
    });
  }

  // Add user to venue
  await db.venueUsers.create({
    data: {
      userId,
      venueId: venue.id,
      comments: 'Joined via QR invitation',
    },
  });

  return res.status(200).json({
    success: true,
    venueId: venue.id,
    message: 'Successfully joined the venue',
    addedToWorkspace: !userWorkspace,
  });
});

// Reject venue invitation
venuesRouter.post('/invitation/:token/reject', (req, res) => {
  // Auth check
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // For now, rejection doesn't do anything in the database
  // Just return success
  return res.status(200).json({
    success: true,
  });
});

// Generate venue check-in token
venuesRouter.post(
  '/:workspaceId/venues/:venueId/generate-check-in',
  async (req, res) => {
    // Auth check
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { workspaceId, venueId } = req.params;
    const userId = req.auth.user.id;

    // Check if user is admin/trainer in the workspace
    const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
      userId,
      workspaceId
    );

    if (
      !userWorkspace ||
      ((userWorkspace.role as UserRoleEnum) !== UserRoleEnum.ADMIN &&
        (userWorkspace.role as UserRoleEnum) !== UserRoleEnum.VENUE_OWNER)
    ) {
      return res.status(403).send({
        error:
          'Forbidden - Only trainers and admins can generate check-in QR codes',
      });
    }

    // Generate or get existing checking token
    const token = await db.venue.generateCheckingToken(venueId);

    // Build check-in URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkInUrl = `${baseUrl}/venues/check-in/${token}`;

    return res.status(200).json({
      token,
      checkInUrl,
    });
  }
);

// Validate venue check-in
venuesRouter.get('/check-in/:token/validate', async (req, res) => {
  if (!req.auth) {
    return res.status(401).send({
      error: 'You must be logged in to check in',
    });
  }

  const { token } = req.params;
  const userId = req.auth.user.id;

  // Use the helper function to validate check-in prerequisites
  const validation = await validateCheckInPrerequisites(token, userId);

  if (validation.error) {
    return res.status(validation.status).send({
      error: validation.message,
    });
  }

  // All good, user can check in
  return res.status(200).json({
    venue: validation.venue,
    isActive: true,
    userStatus: validation.venueUser.status,
    canCheckIn: true,
  });
});

// Perform venue check-in
venuesRouter.post('/check-in/:token/perform', async (req, res) => {
  // Auth check
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { token } = req.params;
  const userId = req.auth.user.id;

  // Use the helper function to validate check-in prerequisites
  const validation = await validateCheckInPrerequisites(token, userId);

  if (validation.error) {
    return res.status(validation.status).send({
      error: validation.message,
    });
  }

  // Update status to 'checking' (checked-in)
  await db.venueUsers.updateStatus(userId, validation.venue.id, 'checking');

  return res.status(200).json({
    success: true,
    venueId: validation.venue.id,
    venueName: validation.venue.name,
    message: 'Successfully checked in to the venue',
  });
});

// Toggle venue status (activate/deactivate)
venuesRouter.patch('/:workspaceId/venues/:venueId/status', async (req, res) => {
  // Auth check
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const userId = req.auth.user.id;
  const { venueId } = req.params;
  const { isActive } = req.body;

  // Get full user to check if they're a super admin
  const user = await db.user.findUniqueByPk(userId);
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  // Only super admins can toggle venue status
  if (!user.isSuperAdmin) {
    return res.status(403).send({
      error: 'Forbidden - Only super admins can change venue status',
    });
  }

  // Find the venue
  const venue = await db.venue.findUniqueByPk(venueId);
  if (!venue) {
    return res.status(404).send({ error: 'Venue not found' });
  }

  // Update venue status
  const updatedVenue = await db.venue.update({
    pk: venueId,
    data: { isActive },
  });

  return res.status(200).json({
    success: true,
    venue: updatedVenue,
  });
});

// Update venue user status (for trainers/admins to manually set participant status)
venuesRouter.patch(
  '/:workspaceId/venues/:venueId/users/:userId/status',
  async (req, res) => {
    // Auth check
    if (req.auth == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { workspaceId, venueId, userId } = req.params;
    const { status } = req.body;
    const currentUserId = req.auth.user.id;

    // Check if user is admin/trainer in the workspace
    const userWorkspace = await db.userWorkspaces.findByUserIdAndWorkspaceId(
      currentUserId,
      workspaceId
    );

    if (
      !userWorkspace ||
      ((userWorkspace.role as UserRoleEnum) !== UserRoleEnum.ADMIN &&
        (userWorkspace.role as UserRoleEnum) !== UserRoleEnum.VENUE_OWNER)
    ) {
      return res.status(403).send({
        error:
          'Forbidden - Only trainers and admins can update participant status',
      });
    }

    // Check if venue exists
    const venue = await db.venue.findUniqueByPk(venueId);
    if (!venue) {
      return res.status(404).send({ error: 'Venue not found' });
    }

    // Check if user is in the venue
    const venueUser = await db.venueUsers.findByUserAndVenue(userId, venueId);
    if (!venueUser) {
      return res.status(404).send({ error: 'User not found in this venue' });
    }

    // Update status
    await db.venueUsers.updateStatus(userId, venueId, status);

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
    });
  }
);
venuesRouter.get('/user/:userId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.venue.getVenuesByOwner(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get venues' });
  }
});

venuesRouter.get('/:venueId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { venueId } = req.params;
  if (!venueId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.venue.getVenueById(venueId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get venue' });
  }
});

venuesRouter.patch('/:venueId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { venueId } = req.params;
  if (!venueId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsed = updateVenueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const result = await db.venue.updateVenueById(venueId, parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update venue' });
  }
});
