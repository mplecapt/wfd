import z from 'zod'

export const IngredientCategories = [
	"Eggs & Dairy",
	"Beef",
	"Poultry",
] as const;

export const createIngredientSchema = z.object({
	name: z.string().min(3),
	category: z.enum(IngredientCategories),
})
export type CreateIngredientInput = z.TypeOf<typeof createIngredientSchema>

export const updateIngredientSchema = z.object({
	ingredientId: z.string().uuid(),
	name: z.string().min(3).optional(),
	category: z.enum(IngredientCategories).optional()
})
export type UpdateIngredientInput = z.TypeOf<typeof updateIngredientSchema>