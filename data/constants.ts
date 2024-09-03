export const drawerProps = {
	motionProps: {
		variants: {
			enter: {
				x: 0,
				transition: {
					duration: 0.2,
					ease: "easeOut",
				},
			},
			exit: {
				x: +400,
				transition: {
					duration: 0.2,
					ease: "easeOut",
				},
			},
		},
	},
	classNames: {
		dialog: "",
		backdrop: "bg-content1/60 scrollbar-hide z-[1000] ",
		base: "justify-start  scrollbar-hide rounded-none scrollbar-default overflow-y-scroll right-0 absolute mx-0 mr-0 !m-0 sm:mx-0 md:mx-0 lg:mx-0 sm:my-0 my-0 p-0 max-h-0 h-dvh h-full",
		wrapper: "items-start scrollbar-hide !m-0 mx-0 z-[1000] justify-start",
		closeButton: "z-100",
	},
};

export const permamentSCMembers = ["US", "GB", "FR", "RU", "CN"];

export const departmentTypes = {
	IT: "IT",
	MEDINEWS: "MediNews",
	APPROVALPANEL: "Approval Panel",
	SALES: "Sales",
	FOODANDCATERING: "Food & Catering",
	PREP: "Prep",
	ADMINSTAFF: "Admin Staff",
	OTHER: "Other",
};

export const DayTypeMap = {
	CONFERENCE: "Conference",
	WORKSHOP: "Workshop",
};

export const committeeTypeMap = {
	GENERALASSEMBLY: "General Assembly",
	SPECIALCOMMITTEE: "Special Committee",
	SECURITYCOUNCIL: "Security Council",
};

export const usersPerPage = 10;

export const roleRanks = {
	Delegate: 9,
	"School Director": 8,
	Member: 7,
	Chair: 6,
	Manager: 6,
	"Deputy Secretary-General": 5,
	"Deputy President of the General Assembly": 5,
	"President of the General Assembly": 4,
	"Secretary-General": 4,
	Director: 3,
	"Senior Director": 2,
	Admin: 1,
	"Global Admin": 0,
};
