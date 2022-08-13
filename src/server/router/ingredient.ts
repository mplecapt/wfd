import { z } from "zod";
import { createIngredientSchema, deleteIngredientSchema, queryIngredientInput, updateIngredientSchema } from "../../schemas/ingredient.schema";
import { CatchPrismaErrors } from "../../utils/PrismaErrors";
import { createRouter } from "./context";

export const ingredientRouter = createRouter()
	.mutation('create-new', {
		input: createIngredientSchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				const ingr = ctx.prisma.ingredient.create({
					data: {
						name: input.name,
						category: input.category,
					}
				})
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('update', {
		input: updateIngredientSchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				const ingr = ctx.prisma.ingredient.update({
					where: { id: input.ingredientId },
					data: {
						name: input.name,
						category: input.category
					}
				})
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.mutation('delete', {
		input: deleteIngredientSchema,
		async resolve({ ctx, input }) {
			ctx.LOGGED_IN()

			try {
				ctx.prisma.ingredient.delete({
					where: { id: input.ingredientId },
				})
			} catch (e) {
				CatchPrismaErrors(e)
			}
		}
	})


	.query('all-ingredients', {
		input: queryIngredientInput,
		resolve({ ctx, input }) {
			const where = input.filter ? {
				OR: [
					{ name: { contains: input.filter } },
					{ category: { contains: input.filter } }
				]
			} : {}

			const ingredients = ctx.prisma.ingredient.findMany({
				where,
				skip: input.skip,
				take: input.take,
				orderBy: input.orderBy
			})
			const count = ctx.prisma.ingredient.count({ where })

			return { ingredients, count }
		}
	})