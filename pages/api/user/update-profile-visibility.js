export default async function handler ( req, res )
{
  await new Promise( resolve => setTimeout( resolve, 7000 ) ); // 3 sec
}