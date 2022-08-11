import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

const createPostSchema = z.object({
	title: z.string().max(256, "Max title length is 256"),
	body: z.string().min(10),
})
export type CreatePostInput = z.TypeOf<typeof createPostSchema>

const singlePostSchema = z.object({
	postId: z.string().uuid(),
})

export const postRouter = createRouter()
	.mutation('create-post', {
		input: createPostSchema,
		async resolve({ctx, input}) {
			if (!ctx.user) {
				new TRPCError({
					code: 'FORBIDDEN',
					message: 'Cannot create a post while logged out'
				})
			}

			const post = await ctx.prisma.post.create({
				data: {
					...input,
					user: { connect: { id: ctx.user?.id } },
				}
			})

			return post
		}
	})

	.query('posts', {
		resolve({ ctx }) {
			return ctx.prisma.post.findMany();
		}
	})

	.query('single-post', {
		input: singlePostSchema,
		resolve({ ctx, input }) {
			return ctx.prisma.post.findUnique({ where: { id: input.postId } });
		}
	})