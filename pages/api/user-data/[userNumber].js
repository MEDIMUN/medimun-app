import { userData } from "../../../lib/user-data.jsx";

export default async ( req, res ) =>
{
   const { userNumber } = req.query;

   const user = await userData( userNumber );

   res.status( 200 ).json( user );
};