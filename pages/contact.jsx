import Pagelayout from "../page-components/layout";
import { getSession, useSession } from "next-auth/react";
import Layout from "../app-components/layout";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardBody, CardHeader, Text } from "@chakra-ui/react";
import { Spacer } from "@nextui-org/react";
import style from "../styles/contact.module.css";
import { HiPhone } from "react-icons/hi";

/** @param {import('next').InferGetServerSidePropsType<typeof getServerSideProps> } props */
export default function HomePage({ props }) {
	console.log(props);
	const router = useRouter();
	const { data: userSession, status } = useSession();

	if (status === "loading") return <div>Loading...</div>;

	if (!userSession) {
		return (
			<Pagelayout backgroundColor="white">
				<div className={style.page}>
					<Page />
				</div>
			</Pagelayout>
		);
	}

	if (userSession) {
		return (
			<Layout page={"Contact"}>
				<Page />
			</Layout>
		);
	}
}

export function Page() {
	return (
		<div>
			<div className={style.background}>
				<Text mt="228px" position="absolute" ml={10} className="pageTitle">
					Contact Us
				</Text>
			</div>
			<Spacer y={2} />
			<div className={style.cards}>
				<Card>
					<CardHeader>
						<Text fontSize="20px" fontWeight="650">
							Phone
						</Text>
					</CardHeader>
					<CardBody></CardBody>
				</Card>
				<Card>
					<CardBody>
						<Text>Email</Text>
					</CardBody>
				</Card>
				<Card>
					<CardBody>
						<Text>Mail</Text>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}

export async function getStaticProps() {
	return {
		props: {
			phoneNumber: "123456789",
			email: "info@medimun.org",
			address: "Medimun, 1234, 1234 AB, Amsterdam, The Netherlands",
			socials: [
				{
					name: "Facebook",
					link: "https://www.facebook.com/medimun",
					icon: "facebook",
				},
			],
		},
		revalidate: 10,
	};
}
