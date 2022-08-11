import { createRouter } from "./context";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import {TRPCError} from '@trpc/server'
import { sendLoginEmail } from "../../utils/mailer";
import { baseUrl, SALT_IT } from '../../utils/constants';
import { decode, encode } from "../../utils/base64";
import { signJwt } from "../../utils/jwt";
import { serialize } from "cookie";
import { createUserSchema, requestOTPSchema, verifyLoginSchema, verifyOTPSchema } from "../../schemas/user.schema";
import bcrypt from 'bcryptjs'

/**
 * TRCP Routing
 */
export const userRouter = createRouter()
	/**
	 * Register new user
	 */
	.mutation('register-user', {
		input: createUserSchema,
		resolve: async ({ctx, input}) => {
			const hashedPass = bcrypt.hashSync(input.password, SALT_IT)

			try {
				const user = await ctx.prisma.user.create({
					data: {
						name: input.name,
						email: input.email,
						password: hashedPass
					}
				})
				
				return user
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError) {
					if (e.code === 'P2002') {
						throw new TRPCError({
							code: 'CONFLICT',
							message: 'User already exists',
						})
					}
				}
				
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong'
				})
			}
		},
	})
	.mutation('verify-login', {
		input: verifyLoginSchema,
		async resolve({ ctx, input }) {
			// find user
			const user = await ctx.prisma.user.findUnique({
				where: { email: input.email }
			})

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User email not found'
				})
			}

			// verify password
			if (!bcrypt.compareSync(input.password, user.password)) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Invalid email or password'
				})
			}

			// create token
			const token = await ctx.prisma.loginToken.create({
				data: {
					redirect: input.redirect,
					user: { connect: { id: user.id } },
				},
				include: {
					user: true
				}
			})

			// sign token
			const jwt = signJwt({
				email: token.user.email,
				id: token.user.id
			})

			ctx.res?.setHeader('Set-Cookie', serialize('token', jwt, {path: '/'}))

			return {
				redirect: token.redirect,
			}
		}
	})
	/**
	 * Request one time password login
	 */
	.mutation('request-otp', {
		input: requestOTPSchema,
		async resolve({ctx, input}) {
			const {email, redirect} = input

			const user = await ctx.prisma.user.findUnique({
				where: { email },
			})

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found',
				})
			}

			const token = await ctx.prisma.loginToken.create({
				data: {
					redirect,
					user: { connect: { id: user.id } },
				}
			})

			await sendLoginEmail({
				token: encode(`${token.id}:${user.email}`),
				url: baseUrl,
				email: user.email
			})

			return true
		}
	})
	/**
	 * Token handler
	 */
	.query('verify-otp', {
		input: verifyOTPSchema,
		async resolve({ ctx, input }) {
			const decoded = decode(input.hash).split(':')
			const [id, email] = decoded

			const token = await ctx.prisma.loginToken.findFirst({
				where: {
					id,
					user: { email },
				},
				include: {
					user: true,
				}
			})

			if (!token) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Invalid token',
				})
			}

			const jwt = signJwt({
				email: token.user.email,
				id: token.user.id
			})

			ctx.res?.setHeader('Set-Cookie', serialize('token', jwt, {path: '/'}))

			return {
				redirect: token.redirect,
			}
		}
	})
	/**
	 * request logged in user data
	 */
	.query('me', {
		resolve({ctx}) {
			return ctx.user
		}
	})
	/**
	 * logout user
	 */
	.query('logout-user', {
		resolve({ctx}) {
			ctx.res?.setHeader('Set-Cookie', serialize('token', 'deleted', { path: '/', expires: new Date(0) }))
			return { redirect: '/' }
		}
	})