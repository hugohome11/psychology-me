import NextAuth from "next-auth";
import { authConfig } from "../../../../lib/auth";

// next-auth v4: NextAuth(...) returns a single handler function.
// Export it for both GET and POST.
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
