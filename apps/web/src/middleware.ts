import withAuth from 'next-auth/middleware';

export default withAuth(() => {}, { pages: { signIn: '/auth/sign-in' } });

// TODO: Implement middleware for role-based access control when the feature is ready
// export async function middleware(request: NextRequest): Promise<NextResponse> {
//   const token = await getToken({ req: request });

//   if (!token) {
//     return NextResponse.rewrite(new URL('/auth/sign-in', request.url));
//   }

//   const role = token.role as string;

//   if (
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
//     role !== UserRoleEnum.SUPER_ADMIN &&
//     request.nextUrl.pathname.startsWith('/admin')
//   ) {
//     // Redirect to 403 page if user is not a super admin and tries to access /admin
//     return NextResponse.rewrite(new URL('/404', request.url));
//   }

//   const haveAccess = doesRoleHaveAccessToURL(role, request.nextUrl.pathname);
//   if (!haveAccess) {
//     // Redirect to login page if user has no access to that particular page
//     return NextResponse.rewrite(new URL('/404', request.url));
//   }

//   return NextResponse.next();
// }

export const config = {
  matcher: [
    '/((?!api|auth|invitation|_next/static|_next/image|favicon.ico|logo.svg|logo.png).*)',
  ],
};
