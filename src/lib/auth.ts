import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    });

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                role: "STUDENT",
                            }
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error during Google sign in synchronization:", error);
                    return true;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                // For Credentials, user already has the data from authorize()
                // For Google, we need to fetch it from the database we just synced with
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! }
                });

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
});
