import Background from "@/components/website/Background";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata = {
	title: "Code of Conduct",
};

const policy = `
_Last Updated: 28/01/2024_

BLUE\n
BLUE HOODIE\n
BLUE HOODIES\n
BLUE SWEATER\n
BLUE SWEATERS\n
ANYTHING BLUE\n

`;

export default async function Page() {
	const elId = Math.random().toString(36);
	return (
		<>
			<Background id={elId} />
			<div id={elId} className="mx-auto max-w-[1248px] p-5 pt-20 font-[montserrat] text-white">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">Forbidden Words</h1>
				<MDXRemote components={{ h1, h2, h3, h4, h5, h6, p, a, hr, li, ol, ul }} source={policy} />
			</div>
		</>
	);
}

const h1 = (props) => {
	return <h1 className="font-md mb-3 select-none text-3xl tracking-tight text-red-700" {...props} />;
};

const h2 = (props) => {
	return <h2 className="font-md mb-3 text-2xl tracking-tight" {...props} />;
};

const h3 = (props) => {
	return <h3 className="font-md mb-3 text-xl tracking-tight" {...props} />;
};

const h4 = (props) => {
	return <h4 className="font-md mb-3 text-lg tracking-tight" {...props} />;
};

const h5 = (props) => {
	return <h5 className="font-md text-md mb-3 tracking-tight" {...props} />;
};

const h6 = (props) => {
	return <h6 className="font-md mb-3 text-sm tracking-tight" {...props} />;
};

const p = (props) => {
	return <p className="font-md text-md mb-5 tracking-tight" {...props} />;
};

const a = (props) => {
	let truncated = props.href.slice(0, 40);
	if (props.href.length > 40) {
		truncated += "...";
	}
	if (props.href.includes("http")) {
		return <a truncated={truncated} target="_blank" className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-blue-700 hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_('attr(truncated)')_↗']" {...props}></a>;
	}
	return <Link truncated={truncated} className="font-md text-md mb-5 max-w-[300px] truncate tracking-tight text-blue-700 duration-300 after:content-['_↗'] hover:rounded-3xl hover:bg-[var(--medired)] hover:p-2 hover:px-4 hover:text-white hover:shadow-lg hover:after:content-['_(Internal_Navigation:'attr(truncated)')_↗']" {...props} />;
};

const hr = (props) => {
	return <hr className="font-md text-md mb-5 tracking-tight" {...props} />;
};
const li = (props) => {
	return <li className="font-md text-md mx-2 tracking-tight " {...props} />;
};

const ol = (props) => {
	return <ol className="font-md text-md mb-5 bg-black tracking-tight" {...props} />;
};

const ul = (props) => {
	return <ol className="font-md text-md mb-5 border-l-2 border-gray-300 pl-3 tracking-tight" {...props} />;
};
