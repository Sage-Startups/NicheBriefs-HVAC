import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import {
  users,
  workspaces,
  subscriptions,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users as never,
    accountsTable: accounts as never,
    sessionsTable: sessions as never,
    verificationTokensTable: verificationTokens as never,
  }),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        if (credentials.password !== "demo") return null;

        const email = credentials.email as string;
        let user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name: email.split("@")[0],
              authProvider: "credentials",
            })
            .returning();
          user = newUser;
          await ensureWorkspace(user.id);
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider !== "credentials") {
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });
        if (!dbUser) {
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email,
              name: user.name ?? user.email.split("@")[0],
              image: user.image ?? null,
              authProvider: account?.provider ?? "oauth",
            })
            .returning();
          dbUser = newUser;
        }
        user.id = dbUser.id;
        await ensureWorkspace(dbUser.id);
      }
      return true;
    },
  },
});

async function ensureWorkspace(userId: string) {
  const existing = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerUserId, userId),
  });
  if (!existing) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    const [workspace] = await db
      .insert(workspaces)
      .values({
        ownerUserId: userId,
        name: user?.name ? `${user.name}'s Workspace` : "My Workspace",
      })
      .returning();
    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      status: "trialing",
      planName: "Trial",
    });
  }
}

export async function getCurrentWorkspace(userId: string) {
  return db.query.workspaces.findFirst({
    where: eq(workspaces.ownerUserId, userId),
    with: { subscriptions: true },
  });
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
