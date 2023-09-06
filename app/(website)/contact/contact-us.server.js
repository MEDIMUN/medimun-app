"use server";

import { verifyServerCaptcha } from "@/lib/verify-chapta";
import "server-only";

export async function contactUs ( formData ) {
   const token = formData.get( "token" );
   const captcha = await verifyServerCaptcha( token );
   if ( !captcha ) return { ok: false, error: "Failed Captcha", title: "Failed Captcha", variant: "destructive" };
   const name = formData.get( "name" );
   const email = formData.get( "email" );
   const message = formData.get( "message" );
   if ( !name || !email || !message ) return { ok: false, error: "Please fill out all fields", title: "Please fill out all fields", variant: "destructive" };
   console.log( { name, email, message } );
   return { ok: true, title: "Message Sent", description: "We will be in touch soon", variant: "default" };
}
