'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/enhanced-data-table';

import { deleteTaskAction } from '~/(dashboard)/home/(user)/server-actions';
import { Database } from '~/lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

export function TasksTable(props: {
  data: Task[];
  page: number;
  pageSize: number;
  pageCount: number;
}) {
  return (
    <div>
      <DataTable {...props} columns={getColumns()} />
    </div>
  );
}

function getColumns(): ColumnDef<Task>[] {
  return [
    {
      header: 'Task',
      cell: ({ row }) => (
        <Link
          className={'hover:underline'}
          href={`/home/tasks/${row.original.id}`}
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      header: 'Created At',
      accessorKey: 'created_at',
    },
    {
      header: 'Updated At',
      accessorKey: 'updated_at',
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div className={'flex justify-end space-x-2'}>
            <Link href={`/home/tasks/${id}`}>
              <Button variant={'ghost'} size={'icon'}>
                <Pencil className={'h-4'} />
              </Button>
            </Link>

            <ConfirmDeleteTask taskId={id}>
              <Button variant={'ghost'} size={'icon'}>
                <Trash className={'h-4'} />
              </Button>
            </ConfirmDeleteTask>
          </div>
        );
      },
    },
  ];
}

function ConfirmDeleteTask(
  props: React.PropsWithChildren<{
    taskId: string;
  }>,
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>Delete Task</AlertDialogHeader>

        <AlertDialogDescription>
          Are you sure you want to delete this task?
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <form action={deleteTaskAction}>
            <input type="hidden" name={'id'} value={props.taskId} />

            <Button variant={'destructive'}>Delete</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
