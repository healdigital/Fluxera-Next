import { use } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { createTeamAccountsApi } from '@kit/team-accounts/api';

import { createChatMessagesService } from '~/home/[account]/chat/_lib/server/chat-messages.service';
import { withI18n } from '~/lib/i18n/with-i18n';

import { ChatContainer } from '../_components/chat-container';

interface Props {
  params: Promise<{
    account: string;
    referenceId: string;
  }>;

  searchParams: Promise<{
    content?: string;
  }>;
}

function ChatPage(props: Props) {
  const client = getSupabaseServerComponentClient();

  const teamAccountsApi = createTeamAccountsApi(client);
  const service = createChatMessagesService(client);
  const params = use(props.params);

  const [data, account] = use(
    Promise.all([
      service.getMessages({
        chatReferenceId: params.referenceId,
        page: 0,
      }),
      teamAccountsApi.getTeamAccount(params.account),
    ]),
  );

  const messages = data.map((message) => {
    const createdAt = message.createdAt
      ? new Date(message.createdAt)
      : undefined;

    return {
      ...message,
      createdAt,
    };
  });

  const content = use(props.searchParams).content;

  return (
    <ChatContainer
      content={content}
      referenceId={params.referenceId}
      accountId={account.id}
      messages={messages}
    />
  );
}

export default withI18n(ChatPage);
