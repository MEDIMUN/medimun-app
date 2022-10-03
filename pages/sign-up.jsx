import React from "react";
import style from "../styles/sign-up.module.css";

import { Input, useInput, Dropdown, Spacer } from "@nextui-org/react";
import Pagelayout from "../components/layouts/page-layout";

export default function SignupPage() {
	const { value, reset, bindings } = useInput("");

	const validateEmail = (value) => {
		return value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
	};

	const helper = React.useMemo(() => {
		if (!value)
			return {
				text: "",
				color: "",
			};
		const isValid = validateEmail(value);
		return {
			text: isValid ? "Valid email" : "Enter a valid email",
			color: isValid ? "success" : "error",
		};
	}, [value]);

	return (
		<Pagelayout>
			Basic Info
			<div className={style.names}>
				<Input
					{...bindings}
					bordered
					onClearClick={reset}
					status={helper.color}
					color={helper.color}
					helperColor={helper.color || "default"}
					helperText={helper.text || "Your email will also be your username."}
					type="email"
					label="Email"
				/>
				<div>
					<Input
						label="Phone Number"
						placeholder=""
						helperText={"Optional but recommended"}
						bordered
					/>
				</div>
				<Input
					clearable
					bordered
					onClearClick={reset}
					type="text"
					label="Name"
					helperText={"Official Name"}
				/>
				<Input
					clearable
					bordered
					required
					onClearClick={reset}
					type="text"
					label="Surname"
					helperText={"Official Surname"}
				/>
				<Input
					required
					bordered
					label="Date of Birth"
					type="date"
					helperText={"Official Birthday"}
				/>
			</div>
		</Pagelayout>
	);
}
