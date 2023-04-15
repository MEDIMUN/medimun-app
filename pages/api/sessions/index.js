import prisma from "@client";

export default async function handler ( req, res )
{
	if ( req.method !== "GET" )
	{
		res.status( 401 );
		return;
	}
	const sessions = await prisma.session.findMany( {
		select: {
			number: true,
		}
	} );

	console.log( sessions );

	const filtered = sessions.map( ( session ) => session.number ).sort( ( a, b ) => b - a );

	return res.status( 200 ).json( filtered );
}
