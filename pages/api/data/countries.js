import { countryCodesAndNames } from "../../../data/countries";

export default async function ( req, res )
{
  if ( req.method != "GET" ) return;
  res.status( 200 ).json( countryCodesAndNames );
}