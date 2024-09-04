import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from 'bcrypt';
import prisma from '../../../../libs/prismadb'; // Adjust the path to your Prisma client

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.hashedPassword) {
            throw new Error('No user found or incorrect password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (!isPasswordValid) {
            throw new Error('Incorrect password');
          }

          return user;
        } catch (error) {
          throw new Error('An error occurred during authorization');
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect to sign-in page on error
  },
  secret: process.env.AUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // Session will expire in 60 minutes
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!user.email) {
          throw new Error('Email is required for sign-in');
        }

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name || '',
                email: user.email,
                hashedPassword: '', // No password for OAuth users
              },
            });
          }
        } catch (error) {
          throw new Error('An error occurred while processing sign-in');
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to /analytics after sign-in or if the URL is the base URL or sign-in page
      if (url === baseUrl || url === `${baseUrl}/auth/signin`) {
        return '/analytics';
      }
      return url;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
