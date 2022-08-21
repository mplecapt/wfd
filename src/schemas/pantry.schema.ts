import z from 'zod'

const Sort = z.enum(['asc', 'desc'])

export const createPantrySchema = z.object({
	name: z.string().min(3, "Name must be between 3-16 characters").max(16, "Name must be between 3-16 characters"),
	pantryId: z.string().uuid("Invalid id").optional()
})
export type CreatePantryInput = z.TypeOf<typeof createPantrySchema>

export const selectPantrySchema = z.object({
	pantryId: z.string().uuid('Invalid id')
})
export type SelectPantryInput = z.TypeOf<typeof selectPantrySchema>



export const selectInventorySchema = z.object({
	id: z.string().uuid('Invalid id'),
})
export type SelectInventoryInput = z.TypeOf<typeof selectInventorySchema>

export const addIngredientToPantrySchema = z.object({
	pantryId: z.string().uuid('Invalid id'),
	ingredientId: z.string().uuid('Invalid id'),
	inStock: z.boolean().optional(),
	expiration: z.date().min(new Date()).optional(),
})
export type AddIngredientInput = z.TypeOf<typeof addIngredientToPantrySchema>

export const updateInventorySchema = z.object({
	itemId: z.string().uuid('Invalid id'),
	inStock: z.boolean().optional(),
	expiration: z.date().min(new Date()).optional(),
})
export type UpdateInventoryInput = z.TypeOf<typeof updateInventorySchema>


export const myPantrySchema = z.object({
	filter: z.string().optional(),
	skip: z.number().int().optional(),
	take: z.number().int().optional(),
	orderBy: z.object({
		name: Sort
	}).optional()
})
export type MyPantryInput = z.TypeOf<typeof myPantrySchema>