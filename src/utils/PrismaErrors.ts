import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";

export const CatchPrismaErrors = (e: unknown) => {
	if (e instanceof PrismaClientKnownRequestError) {
		switch (e.code) {
			case 'P2005': case 'P2006': case 'P2007': 
				throw new TRPCError({ code: 'BAD_REQUEST', message: e.message })
			case 'P2002': case 'P2003': case 'P2004': 
				throw new TRPCError({ code: 'CONFLICT', message: e.message })
			case 'P2026': 
				throw new TRPCError({ code: 'METHOD_NOT_SUPPORTED', message: e.message })
			case 'P2001': case 'P2015': case 'P2018': 
				throw new TRPCError({ code: 'NOT_FOUND', message: e.message })
			case 'P2000': case 'P2008': case 'P2020': 
				throw new TRPCError({ code: 'PARSE_ERROR', message: e.message })
			case 'P2024': 
				throw new TRPCError({ code: 'TIMEOUT', message: e.message })
			default: 
				throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message })
		}
	}
	throw new TRPCError({
		code: 'INTERNAL_SERVER_ERROR',
		message: 'Something went wrong'
	})
}