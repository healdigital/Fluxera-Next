'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { WriteTaskSchema } from '~/(dashboard)/home/(user)/_lib/schema/write-task.schema';

export async function addTaskAction(params: z.infer<typeof WriteTaskSchema>) {
  'use server';

  const task = WriteTaskSchema.parse(params);

  const logger = await getLogger();
  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (!auth.data) {
    redirect(auth.redirectTo);
  }

  logger.info(task, `Adding task...`);

  const { data, error } = await client
    .from('tasks')
    .insert({ ...task, account_id: auth.data.id });

  if (error) {
    logger.error(error, `Failed to add task`);

    throw new Error(`Failed to add task`);
  }

  logger.info(data, `Task added successfully`);

  revalidatePath('/home', 'page');

  return null;
}

export async function updateTaskAction(
  id: string,
  params: z.infer<typeof WriteTaskSchema>,
) {
  'use server';

  const task = WriteTaskSchema.parse(params);

  const logger = await getLogger();
  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (!auth.data) {
    redirect(auth.redirectTo);
  }

  logger.info({ id, task }, `Updating task...`);

  const { data, error } = await client.from('tasks').update(task).eq('id', id);

  if (error) {
    logger.error(error, `Failed to update task`);

    throw new Error(`Failed to update task`);
  }

  logger.info(data, `Task updated successfully`);

  revalidatePath('/home/tasks/[task]', 'page');

  return null;
}

export async function deleteTaskAction(data: FormData) {
  'use server';

  const id = z.string().parse(data.get('id'));
  const logger = await getLogger();
  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (!auth.data) {
    redirect(auth.redirectTo);
  }

  logger.info({ id }, `Deleting task...`);

  const { error } = await client.from('tasks').delete().eq('id', id);

  if (error) {
    logger.error(error, `Failed to delete task`);

    throw new Error(`Failed to delete task`);
  }

  logger.info({ id }, `Task deleted successfully`);

  revalidatePath('/home', 'page');
  revalidatePath('/home/tasks/[task]', 'page');

  return null;
}
