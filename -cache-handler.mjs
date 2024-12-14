import Redis from 'ioredis';

export default class CacheHandler {
	constructor ( options ) {
		this.options = options;
		this.redis = new Redis( process.env.REDIS_URL || 'redis://localhost:6379', {
			retryStrategy ( times ) {
				const delay = Math.min( times * 50, 2000 );
				return delay; // Retry after a delay
			},
		} );

		this.redis.on( 'error', ( err ) => {
			console.error( 'Redis connection error:', err );
		} );

		this.redis.on( 'connect', () => {
			console.log( 'Connected to Redis' );
		} );
	}

	async get ( key ) {
		try {
			const data = await this.redis.get( key );
			return data ? JSON.parse( data ) : null;
		} catch ( error ) {
			console.error( 'Error fetching data from Redis:', error );
			return null;
		}
	}

	async set ( key, data, ctx ) {
		try {
			const value = {
				value: data,
				lastModified: Date.now(),
				tags: ctx.tags,
			};

			const ttl = ctx.revalidate || null; // TTL in seconds
			if ( ttl ) {
				await this.redis.set( key, JSON.stringify( value ), 'EX', ttl );
			} else {
				await this.redis.set( key, JSON.stringify( value ) );
			}
		} catch ( error ) {
			console.error( 'Error setting data in Redis:', error );
		}
	}

	async revalidateTag ( tags ) {
		try {
			tags = [ tags ].flat(); // Ensure tags is an array

			// Retrieve all keys in Redis (use key pattern matching for production systems)
			const keys = await this.redis.keys( '*' );

			for ( const key of keys ) {
				const data = await this.get( key );
				if ( data && data.tags?.some( ( tag ) => tags.includes( tag ) ) ) {
					await this.redis.del( key );
				}
			}
		} catch ( error ) {
			console.error( 'Error revalidating tags in Redis:', error );
		}
	}

	async close () {
		try {
			await this.redis.quit();
		} catch ( error ) {
			console.error( 'Error closing Redis connection:', error );
		}
	}
}
