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
				const pantry = await ctx.prisma.pantry.update({
					where: { id: input.pantryId },
					data: {
						inventory: {
							create: {
								ingredient: { connect: { id: input.ingredientId } },
								inStock: input.inStock,
								expiration: input.expiration
							}
						}
					}
				})

				return { updatedPantry: pantry }
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
				const pantry = ctx.prisma.pantry.update({
					where: { id: input.pantryId },
					data: {
						inventory: {
							deleteMany: [
								{ 
									ingredientId: input.ingredientId,
									pantryId: input.pantryId,
								}
							]
						}
					}
				})

				return { updatedPantry: pantry }
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
				const pantryItem = ctx.prisma.pantryItem.update({
					where: { id: input.itemId },
					data: {
						inStock: input.inStock,
						expiration: input.expiration,
					}
				})

				return { pantryItem: pantryItem }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.query('get-pantry', {
		input: selectPantrySchema,
		resolve({ ctx, input }) {
			
			try {
				const pantry = ctx.prisma.pantry.findUnique({
					where: { id: input.pantryId },
				})

				return { pantry }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.query('my-pantries', {
		input: myPantrySchema,
		async resolve({ ctx, input }) {
			const user = ctx.LOGGED_IN()
			const where = {
				trackedBy: { some: { id: user?.id } },
				...(input.filter && { name: { contains: input.filter } })
			}
			
			try {
				const pantries = await ctx.prisma.pantry.findMany({
					where,
					skip: input.skip,
					take: input.take,
					orderBy: input.orderBy,
					include: {
						inventory: true,
					}
				})

				const inventories = await ctx.prisma.pantryItem.findMany({
					where: { pantry: { trackedBy: { some: { id: user?.id } } } },
					include: {
						ingredient: true
					}
				})

				const count = await ctx.prisma.pantry.count({ where })

				return { pantries, inventories, count }
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})