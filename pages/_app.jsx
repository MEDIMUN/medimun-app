import "../styles/globals.css";
import Head from "next/head";

import { createTheme, NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { AppContextProvider } from "@app-components/context/Navigation";
import { ChakraProvider } from "@chakra-ui/react";
import { SSRProvider } from "@react-aria/ssr";

const theme = createTheme({
	type: "light", // it could be "light" or "dark"
	theme: {
		colors: {
			// brand colors
			primaryLight: "#62B9FF",
			primaryLightHover: "#62B9FF",
			primaryLightActive: "#307AB7",
			primaryLightContrast: "#FFFFFF",
			primary: "#307AB7",
			primaryBorder: "$green500",
			primaryBorderHover: "$green600",
			primarySolidHover: "$green700",
			primarySolidContrast: "$white",
			primaryShadow: "$green500",
			secondary: "#307AB7",
			inherit: "307AB7",
			white: "$white",

			mediBlue: "#307AB7",
			mediBlueLight: "#307AB7",
			mediBlueLightHover: "#307AB7",

			gradient: "linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)",
			link: "#5E1DAD",

			dashboardWhite: "#FFFFFD",
			dashboardGray: "#F0F4F9",

			// you can also create your own color
			myColor: "#307AB7",

			// ...  more colors
		},
		space: {},
		fonts: {},
	},
});

function MyApp({ Component, pageProps }) {
	return (
		<SSRProvider>
			<SessionProvider session={pageProps.session}>
				<AppContextProvider>
					<NextUIProvider theme={theme}>
						<ChakraProvider>
							<Head>
								<meta name="viewport" content="width=device-width, initial-scale=1.0" />
							</Head>
							<Component {...pageProps} />
						</ChakraProvider>
					</NextUIProvider>
				</AppContextProvider>
			</SessionProvider>
		</SSRProvider>
	);
}

export default MyApp;
