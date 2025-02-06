import type React from "react";
import { WifiOff, CloudOff, AlertCircle } from "lucide-react";

const NotConnectedState: React.FC = () => {
	return (
		<div className="flex flex-col font-[Montserrat] items-center justify-left p-6 bg-sidebar-accent rounded-md shadow-sm">
			<div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-md mb-4">
				<WifiOff className="w-8 h-8 text-red-500" />
			</div>
			<h2 className="text-xl font-semibold text-gray-800 mb-2">Not Connected</h2>
			<p className="text-gray-600 mx-auto  max-w-md text-center mb-4 text-pretty">
				Unable to establish a connection. Please check your network settings.
			</p>
			<p className="mb-4 mx-auto text-sm max-w-lg text-center text-gray-600">
				This may be due to WI-Fi issues or MediBook receiving an update. Please check your network settings and try again. If the problem is because
				of an update, please wait a few minutes and try again.
			</p>
			<div className="flex space-x-4">
				<div className="flex flex-col items-center">
					<div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-2">
						<CloudOff className="w-6 h-6 text-gray-500" />
					</div>
					<span className="text-sm text-gray-500">No MediCloud</span>
				</div>
				<div className="flex flex-col items-center">
					<div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-2">
						<AlertCircle className="w-6 h-6 text-gray-500" />
					</div>
					<span className="text-sm text-gray-500">No MediData</span>
				</div>
			</div>
		</div>
	);
};

export default NotConnectedState;
