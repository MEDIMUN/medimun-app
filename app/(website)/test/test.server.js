"use server";

import sendVerificationEmail from "@/email/templates/email-verification";

export async function TestAction () {
   sendVerificationEmail( "Berzan Ozejder", "berzanozejder@gmail.com", "313131" );
}