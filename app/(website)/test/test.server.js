"use server";

import sendVerificationEmail from "@/email/templates/email-verification";

export async function TestAction () {
   sendVerificationEmail( "Test User", "berzanozejder@gmail.com", "123456" );
}