"use client";

export default function Error(props) {
	return <div>{props.error.stack}</div>;
}
