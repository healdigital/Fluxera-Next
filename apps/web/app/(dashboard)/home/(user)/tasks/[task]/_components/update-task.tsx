'use client';

import { useTransition } from 'react';

import { z } from 'zod';

import { Button } from '@kit/ui/button';

import { TaskForm } from '~/(dashboard)/home/(user)/_components/task-form';
import { WriteTaskSchema } from '~/(dashboard)/home/(user)/_lib/schema/write-task.schema';
import { updateTaskAction } from '~/(dashboard)/home/(user)/server-actions';

export function UpdateTask(props: {
  task: z.infer<typeof WriteTaskSchema> & { id: string };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <TaskForm
        task={props.task}
        SubmitButton={() => (
          <div>
            <Button>{pending ? 'Updating...' : 'Update Task'}</Button>
          </div>
        )}
        onSubmit={(data) => {
          startTransition(async () => {
            await updateTaskAction(props.task.id, data);
          });
        }}
      />
    </div>
  );
}
