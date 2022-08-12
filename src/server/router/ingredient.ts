import { createIngredientSchema, updateIngredientSchema } from "../../schemas/ingredient.schema";
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