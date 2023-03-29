export default async function handler ( req, res )
{
  console.log( req.body );
  await new Promise( resolve => setTimeout( resolve, 4000 ) ); // 3 sec
  res.status( 200 ).json( { name: 'John Doe' } );
}

//