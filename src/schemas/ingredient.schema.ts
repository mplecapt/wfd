import z from 'zod'

export const IngredientCategories = [
	"Eggs & Dairy",
	"Beef",
	"Poultry",
] as const;

const Sort = z.enum(['asc', 'desc'])


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

export const deleteIngredientSchema = z.object({
	ingredientId: z.string().uuid()
})
export type DeleteIngredientInput = z.TypeOf<typeof deleteIngredientSchema>


export const queryIngredientInput = z.object({
	filter: z.string().optional(),
	skip: z.number().int().optional(),
	take: z.number().int().optional(),
	orderBy: z.object({
		name: Sort,
		category: Sort
	}).optional()
})
export type QueryIngredientInput = z.TypeOf<typeof queryIngredientInput>

export const notInPantrySchema = z.object({
	pantryId: z.string().uuid()
})
export type QueryNotInPantryInput = z.TypeOf<typeof notInPantrySchema>