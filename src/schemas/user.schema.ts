import z from 'zod'

export const createUserSchema = z.object({
	name: z.string()
		.min(4, "Username must be between 4 and 20 characters")
		.max(20, "Username must be between 4 and 20 characters")
		.regex(/^[\w\- ]+$/, "Username can only contain 'a-z,0-9, ,-'"),
	email: z.string().email(),
	password: z.string().min(11, "Password must be at least 11 characters"),
	confirm: z.string(),
}).refine(data => data.password === data.confirm, {
	message: 'Passwords do not match',
	path: ['confirm']
})
export type CreateUserInput = z.TypeOf<typeof createUserSchema>



export const verifyLoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	redirect: z.string().optional(),
})
export type VerifyLoginInput = z.TypeOf<typeof verifyLoginSchema>



export const requestOTPSchema = z.object({
	email: z.string().email(),
	redirect: z.string().default('/'),
})
export type RequestOTPInput = z.TypeOf<typeof requestOTPSchema>



export const verifyOTPSchema = z.object({
	hash: z.string(),
})
export type VerifyOTPInput = z.TypeOf<typeof verifyOTPSchema>


export const updateUserSchema = z.object({
	name: z.string()
		.min(4, "Username must be between 4 and 20 characters")
		.max(20, "Username must be between 4 and 20 characters")
		.regex(/^[\w\- ]+$/, "Username can only contain 'a-z,0-9, ,-'")
		.optional(),
	password: z.string().min(11, "Password must be at least 11 characters").optional(),
	confirm: z.string().optional(),
}).refine(data => {
	data.password && data.confirm && data.password === data.confirm
}, {
	message: 'Passwords do not match',
	path: ['confirm']
})
export type UpdateUserInput = z.TypeOf<typeof updateUserSchema>