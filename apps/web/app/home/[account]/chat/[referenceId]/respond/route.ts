import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  StreamResponseSchema,
  createChatLLMService,
} from '../../_lib/server/chat-llm.service';

export const dynamic = 'force-dynamic';

export const POST = enhanceRouteHandler(
  async ({ body, params }) => {
    const client = getSupabaseServerClient();
    const adminClient = getSupabaseServerAdminClient();

    const service = createChatLLMService(client, adminClient);
    const referenceId = params.referenceId as string;

    try {
      return await service.streamResponse(body, referenceId);
    } catch (error) {
      console.error(error);

      const message = error instanceof Error ? error.message : 'Unknown error';

      return new Response(message, { status: 500 });
    }
  },
  {
    schema: StreamResponseSchema,
  },
);