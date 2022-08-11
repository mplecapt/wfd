import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { withTRPC } from '@trpc/next'
import {loggerLink} from '@trpc/client/links/loggerLink'
import {httpBatchLink} from '@trpc/client/links/httpBatchLink'
import superjson from 'superjson'
import { AppRouter } from '../server/router'
import { url } from '../utils/constants'
import { trpc } from '../utils/trpc'
import { UserContextProvider } from '../contexts/user.context'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
	const { data, error, isLoading } = trpc.useQuery(['users.me'])

	if (isLoading) return <>Loading user...</>

	return <UserContextProvider value={data}>
		<Layout>
			<Component {...pageProps} />
		</Layout>
	</UserContextProvider>
}

// configure trpc into app
export default withTRPC<AppRouter>({
	config({ ctx }) {
		// get url if hosted or local

		const links = [
			loggerLink(),				// for loggin queries
			httpBatchLink({			// for batching multiple queries per request
				maxBatchSize: 10,
				url
			})
		]

		return {
			queryClientConfig: {
				defaultOptions: {
					queries: {
						staleTime: 60,	// milliseconds before data is considered stale
					},
				},
			},
			headers() {
				if (ctx?.req) {	// pass context headers through
					return {
						...ctx.req.headers,
						'x-ssr': '1',
					}
				}
				return {}
			},
			links,
			transformer: superjson
		}
	},
	ssr: false	// server side rendering
})(MyApp)