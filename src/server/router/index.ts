// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { userRouter } from "./user";
import { postRouter } from "./post";
import { pantryRouter } from "./pantry";
import { ingredientRouter } from "./ingredient";

export const appRouter = createRouter()
  .transformer(superjson)
  // .merge("example.", exampleRouter)
	.merge('users.', userRouter)
	.merge('posts.', postRouter)
	.merge('pantries.', pantryRouter)
	.merge('ingredients.', ingredientRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
