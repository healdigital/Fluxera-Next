'use server';

import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export const createDemoUserAction = async function () {
  const logger = await getLogger();

  try {
    const adminClient = getSupabaseServerAdminClient();

    // Generate a random demo user email
    const randomId = Math.random().toString(36).substring(2, 15);
    const demoEmail = `demo-user-${randomId}@demo.makerkit.dev`;
    const demoPassword = Math.random().toString(36).substring(2, 15);

    logger.info({ demoEmail }, 'Creating demo user...');

    // Create the demo user with admin client
    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          demo_user: true,
          created_at: new Date().toISOString(),
        },
        app_metadata: {
          // Grant some elevated permissions for demo purposes
          demo_account: true,
        },
      });

    if (createError || !userData.user) {
      logger.error({ error: createError }, 'Failed to create demo user');

      throw new Error(
        `Failed to create demo user: ${createError?.message || 'Unknown error'}`,
      );
    }

    const userId = userData.user.id;

    logger.info({ userId, demoEmail }, 'Demo user created successfully');

    // Generate a magic link for automatic sign-in
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: demoEmail,
        options: {
          redirectTo: '/home',
        },
      });

    const actionLink = linkData?.properties?.action_link;

    if (linkError || !actionLink) {
      logger.error(
        { error: linkError, actionLink },
        'Failed to generate magic link',
      );

      throw new Error(
        `Failed to generate magic link: ${linkError?.message || 'Unknown error'}`,
      );
    }

    // Follow the magic link to get the tokens
    const response = await fetch(actionLink, {
      method: 'GET',
      redirect: 'manual',
    });

    const location = response.headers.get('Location');

    if (!location) {
      throw new Error('Error generating magic link. Location header not found');
    }

    const hash = new URL(location).hash.substring(1);
    const query = new URLSearchParams(hash);

    const accessToken = query.get('access_token');
    const refreshToken = query.get('refresh_token');

    if (!accessToken || !refreshToken) {
      logger.error(
        { location, hash },
        'Error generating magic link. Tokens not found in URL hash',
      );

      throw new Error(
        'Error generating magic link. Tokens not found in URL hash',
      );
    }

    logger.info(
      { userId, demoEmail },
      'Demo user tokens generated successfully',
    );

    return {
      success: true,
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: userId,
        email: demoEmail,
        isDemoUser: true,
      },
    };
  } catch (error) {
    logger.error({ error }, 'Error creating demo user');

    throw new Error(
      error instanceof Error ? error.message : 'Failed to create demo user',
    );
  }
};
