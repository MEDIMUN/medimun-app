const ChevronDownIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			fill="none"
			height={size || height || 24}
			viewBox="0 0 24 24"
			width={size || width || 24}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<path
				d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={1.5}
			/>
		</svg>
	);
};

const TagUserIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			fill="none"
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<path
				d="M18 18.86h-.76c-.8 0-1.56.31-2.12.87l-1.71 1.69c-.78.77-2.05.77-2.83 0l-1.71-1.69c-.56-.56-1.33-.87-2.12-.87H6c-1.66 0-3-1.33-3-2.97V4.98c0-1.64 1.34-2.97 3-2.97h12c1.66 0 3 1.33 3 2.97v10.91c0 1.63-1.34 2.97-3 2.97Z"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={1.5}
			/>
			<path
				d="M12 10a2.33 2.33 0 1 0 0-4.66A2.33 2.33 0 0 0 12 10ZM16 15.66c0-1.8-1.79-3.26-4-3.26s-4 1.46-4 3.26"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	);
};

const ServerIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			fill="none"
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<path
				d="M19.32 10H4.69c-1.48 0-2.68-1.21-2.68-2.68V4.69c0-1.48 1.21-2.68 2.68-2.68h14.63C20.8 2.01 22 3.22 22 4.69v2.63C22 8.79 20.79 10 19.32 10ZM19.32 22H4.69c-1.48 0-2.68-1.21-2.68-2.68v-2.63c0-1.48 1.21-2.68 2.68-2.68h14.63c1.48 0 2.68 1.21 2.68 2.68v2.63c0 1.47-1.21 2.68-2.68 2.68ZM6 5v2M10 5v2M6 17v2M10 17v2M14 6h4M14 18h4"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	);
};

const FlashIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			fill="none"
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<path
				d="M6.09 13.28h3.09v7.2c0 1.68.91 2.02 2.02.76l7.57-8.6c.93-1.05.54-1.92-.87-1.92h-3.09v-7.2c0-1.68-.91-2.02-2.02-.76l-7.57 8.6c-.92 1.06-.53 1.92.87 1.92Z"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={1.5}
			/>
		</svg>
	);
};

const ActivityIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			data-name="Iconly/Curved/Activity"
			height={size || height || 24}
			viewBox="0 0 24 24"
			width={size || width || 24}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<g
				fill="none"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={1.5}>
				<path d="M6.918 14.854l2.993-3.889 3.414 2.68 2.929-3.78" />
				<path d="M19.668 2.35a1.922 1.922 0 11-1.922 1.922 1.921 1.921 0 011.922-1.922z" />
				<path d="M20.756 9.269a20.809 20.809 0 01.194 3.034c0 6.938-2.312 9.25-9.25 9.25s-9.25-2.312-9.25-9.25 2.313-9.25 9.25-9.25a20.931 20.931 0 012.983.187" />
			</g>
		</svg>
	);
};

const ScaleIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			fill="none"
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			<path
				d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7ZM18 6 6 18"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
			<path
				d="M18 10V6h-4M6 14v4h4"
				stroke={fill}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	);
};

export const NavbarToggleIcon = ({ fill, size, width = 24, height = 24, ...props }) => {
	return (
		<svg
			width="30"
			height="30"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg">
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M4.53989 2H7.91989C9.32989 2 10.4599 3.15 10.4599 4.561V7.97C10.4599 9.39 9.32989 10.53 7.91989 10.53H4.53989C3.13989 10.53 1.99989 9.39 1.99989 7.97V4.561C1.99989 3.15 3.13989 2 4.53989 2ZM4.53989 13.4697H7.91989C9.32989 13.4697 10.4599 14.6107 10.4599 16.0307V19.4397C10.4599 20.8497 9.32989 21.9997 7.91989 21.9997H4.53989C3.13989 21.9997 1.99989 20.8497 1.99989 19.4397V16.0307C1.99989 14.6107 3.13989 13.4697 4.53989 13.4697ZM19.46 2H16.08C14.67 2 13.54 3.15 13.54 4.561V7.97C13.54 9.39 14.67 10.53 16.08 10.53H19.46C20.86 10.53 22 9.39 22 7.97V4.561C22 3.15 20.86 2 19.46 2ZM16.08 13.4697H19.46C20.86 13.4697 22 14.6107 22 16.0307V19.4397C22 20.8497 20.86 21.9997 19.46 21.9997H16.08C14.67 21.9997 13.54 20.8497 13.54 19.4397V16.0307C13.54 14.6107 14.67 13.4697 16.08 13.4697Z"
				fill="rgb(33, 116, 255"
			/>
		</svg>
	);
};

export const icons = {
	chevron: (
		<ChevronDownIcon
			fill="currentColor"
			size={16}
		/>
	),
	scale: (
		<ScaleIcon
			fill="var(--nextui-colors-warning)"
			size={30}
		/>
	),
	activity: (
		<ActivityIcon
			fill="var(--nextui-colors-secondary)"
			size={30}
		/>
	),
	flash: (
		<FlashIcon
			fill="var(--nextui-colors-primary)"
			size={30}
		/>
	),
	server: (
		<ServerIcon
			fill="var(--nextui-colors-success)"
			size={30}
		/>
	),
	user: (
		<TagUserIcon
			fill="var(--nextui-colors-error)"
			size={30}
		/>
	),
};
