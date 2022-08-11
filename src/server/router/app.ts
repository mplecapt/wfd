import { createRouter } from "./context";

export const myAppRouter = createRouter()
	.query('hello', {
		resolve: () => {
			return 'Hello from trpc server'
		}
	})