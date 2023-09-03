"use server";

import sendVerificationEmail from "@/email/templates/email-verification";

export async function TestAction () {
   console.log( "TestAction" );
   //await sendVerificationEmail( "Berzan", "berzanozejder+99@gmail.com", "999999" );
} 