'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { createChatLLMService } from '~/home/[account]/chat/_lib/server/chat-llm.service';

import { ReferenceIdSchema } from '../schema/reference-id.schema';
import { RenameChatSchema } from '../schema/rename-chat.schema';
import { UpdateChatSchema } from '../schema/update-chat.schema';
import { createChatMessagesService } from './chat-messages.service';

const CreateChatSchema = z.object({
  content: z.string().min(1).max(2000),
  accountId: z.string().uuid(),
  referenceId: ReferenceIdSchema,
});

export const createChatAction = enhanceAction(
  async (body) => {
    const logger = await getLogger();

    const client = getSupabaseServerClient();
    const adminClient = getSupabaseServerAdminClient();

    const service = createChatMessagesService(client);
    const chatService = createChatLLMService(client, adminClient);

    try {
      logger.info(
        {
          accountId: body.accountId,
          name: 'chats.create',
        },
        `Creating new chat...`,
      );

      const chatName = await chatService.createChatNameFromMessage({
        message: body.content,
        accountId: body.accountId,
      });

      await service.createChat({
        accountId: body.accountId,
        chatReferenceId: body.referenceId,
        name: chatName,
        messages: [],
      });

      revalidatePath('/home/[account]/chat', 'layout');

      logger.info(
        {
          accountId: body.accountId,
          name: 'chats.create',
        },
        `Chat successfully created`,
      );

      return {
        success: true,
        message: null,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'chats.create',
        },
        'Error creating chat',
      );

      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'chats:errorCreatingChat',
      };
    }
  },
  {
    schema: CreateChatSchema,
  },
);

export const deleteChatAction = enhanceAction(async (data: FormData) => {
  const chatReferenceId = data.get('chatReferenceId') as string;

  if (!chatReferenceId) {
    throw new Error('Chat reference ID is required');
  }

  const client = getSupabaseServerClient();
  const service = createChatMessagesService(client);

  await service.deleteChat({ chatReferenceId });

  revalidatePath('/home/[account]/chat', 'layout');

  return redirect('../chat');
}, {});

export const renameChatAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();
    const service = createChatMessagesService(client);

    await service.updateChat({
      chatReferenceId: data.referenceId,
      name: data.name,
    });

    revalidatePath('/home/[account]/chat/[referenceId]', 'page');

    return {
      success: true,
    };
  },
  {
    schema: RenameChatSchema,
  },
);

export const updateChatSettingsAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();
    const service = createChatMessagesService(client);

    await service.updateChat({
      chatReferenceId: data.referenceId,
      settings: data.settings,
    });

    return {
      success: true,
    };
  },
  {
    schema: UpdateChatSchema,
  },
);
