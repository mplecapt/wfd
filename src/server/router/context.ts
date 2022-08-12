// src/server/router/context.ts
import { Prisma, PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../utils/jwt";
import { prisma } from "../db/client";

interface CtxUser {
	id: string,
	email: string,
	name: string,
	iat: string,
	exp: number
}

function getUserFromRequest(req: NextApiRequest) {
	const token = req.cookies.token

	if (token) {
		try {
			const verified = verifyJwt<CtxUser>(token)
			return verified
		} catch (e) {
			return null
		}
	}

	return null
}

interface Context {
	req: NextApiRequest | undefined,
	res: NextApiResponse | undefined,
	prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
	user: CtxUser | null | undefined,
	LOGGED_IN(): void
}

export const createContext = (opts?: trpcNext.CreateNextContextOptions): Context => {
  const req = opts?.req;
  const res = opts?.res;

	const user = req && getUserFromRequest(req);

  return {
    req,
    res,
    prisma,
		user,
		LOGGED_IN() {
			if (!user) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Must be logged in to procceed'
				})
			}
		}
  };
};

// type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();