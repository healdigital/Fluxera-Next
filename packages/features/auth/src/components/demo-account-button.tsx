'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { createDemoUserAction } from '../server/demo-user-server-actions';

interface DemoAccountButtonProps {
  onSuccess?: () => void;
}

interface DemoUserResult {
  success: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: {
    id: string;
    email: string;
    isDemoUser: boolean;
  };
}

export function DemoAccountButton({ onSuccess }: DemoAccountButtonProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreateDemo = async () => {
    setError(null);

    startTransition(async () => {
      try {
        const result = (await createDemoUserAction()) as DemoUserResult;

        if (result.success && result.tokens) {
          // Sign out any existing session
          await supabase.auth.signOut();

          // Set the new session with the demo user tokens
          await supabase.auth.setSession({
            access_token: result.tokens.accessToken,
            refresh_token: result.tokens.refreshToken,
          });

          // Navigate to home or call success callback
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/home');
          }

          toast.success('Demo account created successfully!');
        }
      } catch (error) {
        console.error('Failed to create demo user:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create demo account. Please try again.';

        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <Button
        variant="outline"
        onClick={handleCreateDemo}
        disabled={isPending}
        className="w-full"
        data-testid="demo-account-button"
      >
        <If condition={isPending}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </If>

        <If condition={!isPending} fallback={<>Creating demo account...</>}>
          Sign in with a demo account
        </If>
      </Button>

      <If condition={error}>
        <Alert variant="destructive">
          <AlertDescription>
            <Trans
              i18nKey="auth:demoAccountError"
              defaults="Failed to create demo account. Please try again."
            />
          </AlertDescription>
        </Alert>
      </If>
    </div>
  );
}
