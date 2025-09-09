import NextAuth from "next-auth";
import { authConfig } from "../../../../lib/auth";

const handler = NextAuth(authConfig);

// App Router: re-export the bound handler for both methods.
// NextAuth reads the catch-all segment and routes internally.
export { handler as GET, handler as POST };
