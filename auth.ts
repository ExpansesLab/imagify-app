import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./lib/prisma";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
  }
}

const providers: any[] = [
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
  }),
  CredentialsProvider({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      console.log("credentials:", credentials);

      const user = await prisma.user.findFirst({
        where: { email: credentials?.email },
      });

      if (!user) {
        return null;
      }

      console.info("user:", user);

      const passwordCorrect = await compare(
        credentials?.password || "",
        user?.password || ""
      );

      if (passwordCorrect) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } else {
        return null;
      }
    },
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  } else {
    return { id: provider.id, name: provider.name };
  }
});

const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/sign-in",
  },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("User signed in:", user);
    },
    async signOut({ session, token }) {
      console.log("User signed out");
    },
    async createUser({ user }) {
      console.log("New user created:", user);
    },
    async updateUser({ user }) {
      console.log("User updated:", user);
    },
    async linkAccount({ user, account, profile }) {
      console.log("Account linked to user:", user);
    },
    async session({ session, token }) {
      console.log("Session is active:", session);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // Обновлять сессию каждые 24 часа
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
};

// Проверяем и устанавливаем правильный NEXTAUTH_URL
if (!process.env.NEXTAUTH_URL) {
  const defaultUrl = process.env.NODE_ENV === "development" 
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_APP_URL;
  
  process.env.NEXTAUTH_URL = defaultUrl;
}

export const handlers = NextAuth(authOptions);

export const getServerAuthSession = () => getServerSession(authOptions);
