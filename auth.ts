import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./lib/prisma";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";

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
    async session({ session, token, user }) {
      if (session?.user) {
        session.user = {
          ...session.user,
          ...user,
        };
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
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
