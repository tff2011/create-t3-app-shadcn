import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Temporariamente permitindo acesso para testar
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/api/trpc/:path*"],
};
