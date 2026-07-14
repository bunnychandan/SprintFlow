import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession } from "next-auth/next";
import { SystemRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const requiredEnv = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}. See docs/setup-auth.md and .env.example for setup.`,
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? SystemRole.USER;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      const email = user.email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        if (!existingUser.isActive) return false;

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            lastLoginAt: new Date(),
          },
        });

        return true;
      }

      const superAdminExists = await prisma.user.findFirst({
        where: { role: SystemRole.SUPER_ADMIN },
      });

      if (!superAdminExists) {
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image ?? null,
            role: SystemRole.SUPER_ADMIN,
            isActive: true,
            lastLoginAt: new Date(),
          },
        });
        return true;
      }

      const pendingInvitation = await prisma.invitation.findFirst({
        where: {
          email,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingInvitation) {
        const newUser = await prisma.user.create({
          data: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image ?? null,
            role: pendingInvitation.type === "ADMIN" ? SystemRole.ADMIN : SystemRole.USER,
            department: pendingInvitation.department,
            designation: pendingInvitation.designation,
            isActive: true,
            lastLoginAt: new Date(),
          },
        });

        if (pendingInvitation.projectId) {
          await prisma.projectMember.create({
            data: {
              userId: newUser.id,
              projectId: pendingInvitation.projectId,
              roleInProject: pendingInvitation.role,
            },
          });
        }

        await prisma.invitation.update({
          where: { id: pendingInvitation.id },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });

        await prisma.auditLog.create({
          data: {
            entityType: "INVITATION",
            entityId: pendingInvitation.id,
            action: "ACCEPT_INVITATION",
            details: `Invitation accepted by ${email} via Google OAuth sign-in. User ${newUser.id} created.`,
          },
        });

        await prisma.auditLog.create({
          data: {
            actorId: newUser.id,
            entityType: "USER",
            entityId: newUser.id,
            action: "OAUTH_SIGNUP",
            details: `User created via invitation with role ${newUser.role}`,
          },
        });

        return true;
      }

      return "/login?error=NoAccount";
    },
  },
  events: {
    async linkAccount({ account }) {
      console.info("NextAuth account linked", {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      });
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export default handler;

export async function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}
