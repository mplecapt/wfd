import { TRPCError } from "@trpc/server";
import { addIngredientToPantrySchema, createPantrySchema, myPantrySchema, selectInventorySchema, selectPantrySchema, updateInventorySchema } from "../../schemas/pantry.schema";
import { createRouter } from "./context";
import { CatchPrismaErrors } from "../../utils/PrismaErrors";

export const pantryRouter = createRouter()

	.mutation('create-new', {
		input: createPantrySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			const pantry = await ctx.prisma.pantry.create({
				data: {
					name: input.name,
					trackedBy: { connect: { id: ctx.user?.id } }
				},
			})

			return {
				newPantry: pantry
			}
		}
	})


	.mutation('update-name', {
		input: createPantrySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			if (!input.pantryId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Must include pantry id'
				})
			}

			try {
				const pantry = await ctx.prisma.pantry.update({
					where: { id: input.pantryId },
					data: {
						name: input.name
					}
				})
				
				return { updatedPantry: pantry }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('track', {
		input: selectPantrySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				await ctx.prisma.pantry.update({
					where: { id: input.pantryId },
					data: {
						trackedBy: { connect: { id: ctx.user?.id } }
					}
				})
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('untrack', {
		input: selectPantrySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				await ctx.prisma.pantry.update({
					where: { id: input.pantryId },
					data: {
						trackedBy: { disconnect: { id: ctx.user?.id } }
					}
				})
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('add-ingredient', {
		input: addIngredientToPantrySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				const pantryItem = await ctx.prisma.pantryItem.create({
					data: {
						ingredient: { connect: { id: input.ingredientId } },
						pantry: { connect: { id: input.pantryId } },
						inStock: input.inStock,
						expiration: input.expiration,
					},
					include: {
						ingredient: true
					}
				})

				return { newPantryItem: pantryItem }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('remove-ingredient', {
		input: selectInventorySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				const deleted = await ctx.prisma.pantryItem.delete({
					where: { id: input.id }
				})

				return { removedIngredient: deleted }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('update-inventory', {
		input: updateInventorySchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				const pantryItem = await ctx.prisma.pantryItem.update({
					where: { id: input.itemId },
					data: {
						inStock: input.inStock,
						expiration: input.expiration,
					}, 
					include: {
						ingredient: true
					}
				})

				return { pantryItem: pantryItem }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.query('get-inventory', {
		input: selectPantrySchema,
		async resolve({ ctx, input }) {
			
			try {
				const inventory = await ctx.prisma.pantryItem.findMany({
					where: { pantryId: input.pantryId },
					include: {
						ingredient: true
					}
				})

				return { inventory }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.query('my-pantries', {
		input: myPantrySchema,
		async resolve({ ctx, input }) {
			const user = ctx.LOGGED_IN()
			const where = { trackedBy: { some: { id: user?.id } } }
			
			try {
				const pantries = await ctx.prisma.pantry.findMany({
					where,
					select: {
						id: true,
						name: true,
					}
				})
				const count = await ctx.prisma.pantry.count({ where })

				const res = { pantries, count }
				return res
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})