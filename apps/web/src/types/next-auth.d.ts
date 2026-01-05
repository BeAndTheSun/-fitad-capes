/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  type Session = {
    user: {
      /** The user's workspace */
      selectedWorkspace: {
        id: string;
        name: string;
        role: string;
      };
    } & DefaultSession['user'];
  };
}
