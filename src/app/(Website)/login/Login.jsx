"use client";

import { signIn, getSession } from "next-auth/react";

import { useEffect, useState } from "react";
import style from "./Login.module.css";

export default function Login() {
	return <div className={style.login}></div>;
}
