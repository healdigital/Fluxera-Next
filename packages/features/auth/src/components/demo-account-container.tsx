import { Separator } from '@kit/ui/separator';

import { DemoAccountButton } from './demo-account-button';

export function DemoAccountContainer({ onSignIn }: { onSignIn: () => void }) {
  if (process.env.NEXT_PUBLIC_ENABLE_QUICK_DEMO_SIGNIN !== 'true') {
    return null;
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or skip sign up
          </span>
        </div>
      </div>

      <DemoAccountButton onSuccess={onSignIn} />
    </>
  );
}
