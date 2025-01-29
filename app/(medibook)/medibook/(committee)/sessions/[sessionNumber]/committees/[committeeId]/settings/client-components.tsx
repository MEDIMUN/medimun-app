"use client";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { SlugInput } from "@/components/slugInput";
import { Text } from "@/components/text";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { editCommittee } from "./actions";
import { removeSearchParams, updateSearchParams } from "@/lib/search-params";
import { Badge } from "@/components/badge";
import { SearchParamsButton } from "@/app/(medibook)/medibook/client-components";
import { deleteExtraCountry } from "./@extraCountryModal/actions";
import { useFlushState } from "@/hooks/use-flush-state";
import { Ellipsis, X } from "lucide-react";

export function CommitteeSettingsForm({ selectedCommittee }) {
	const router = useRouter();
	const params = useParams();

	const [isLoading, setIsLoading] = useFlushState(false);

	async function editCommitteeHandler(formData: FormData) {
		setIsLoading(true);
		const res = await editCommittee(formData, selectedCommittee.id);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ "create-committee": "", "edit-committee": "", "delete-committee": "" }, router);
			window.location.reload();
		} else {
			toast.error(res?.message);
			router.refresh();
		}
		setIsLoading(false);
	}

	async function deleteCommitteeHandler(extraCountryId) {
		setIsLoading(true);
		const res = await deleteExtraCountry(params, extraCountryId);
		if (res?.ok) {
			router.refresh();
			toast.success(...res?.message);
		} else {
			toast.error(...res?.message);
		}
		setIsLoading(false);
	}

	return (
		<form action={editCommitteeHandler} id="committee-settings" className="mx-auto">
			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Committee Name</Subheading>
					<Text>
						The main, long name of the committee.
						<br />
						<em>Min 5, Max 50 Characters</em>
					</Text>
				</div>
				<div className="flex">
					<Input
						required
						defaultValue={selectedCommittee.name}
						className="my-auto"
						placeholder="e.g. General Assembly 1, Security Council"
						name="name"
					/>
				</div>
			</section>

			<Divider className="my-10" soft />

			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Short Name</Subheading>
					<Text>
						The short name of the committee.
						<br />
						<em>Min 2, Max 4 Characters</em>
					</Text>
				</div>
				<div className="flex">
					<Input
						required
						defaultValue={selectedCommittee.shortName}
						className="my-auto"
						placeholder="e.g. Information Technology, Public Information"
						name="shortName"
					/>
				</div>
			</section>

			<Divider className="my-10" soft />

			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Description</Subheading>
					<Text>
						The description of the committee describing it&apos;s general topic.
						<br />
						<em>Max 100 Characters</em>
					</Text>
				</div>
				<div className="flex">
					<Input
						defaultValue={selectedCommittee.description}
						maxLength={100}
						className="my-auto"
						placeholder="e.g. legal Committee"
						name="description"
					/>
				</div>
			</section>

			<Divider className="my-10" soft />

			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Link Slug</Subheading>
					<Text>
						The short name to be used in the committee link.
						<br />
						<em>Min 2, Max 10 Characters</em>
					</Text>
				</div>
				<div className="flex">
					<SlugInput
						className="my-auto"
						defaultValue={selectedCommittee.slug}
						maxLength={10}
						placeholder="e.g. ga1, ga2, csw, sc"
						minLength={2}
						aria-label="Organization Bio"
						name="slug"
					/>
				</div>
			</section>

			<Divider className="my-10" soft />

			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Committee Type</Subheading>
					<Text>
						The type of the committee, this setting changes committee procedures and available countries and scjouldn&apos;t be changed mid-session.
					</Text>
				</div>
				<div className="flex space-y-4">
					<Select defaultValue={selectedCommittee?.type} required className="my-auto" name="type">
						<option value="GENERALASSEMBLY">General Assembly</option>
						<option value="SECURITYCOUNCIL">Security Council</option>
						<option value="SPECIALCOMMITTEE">Special Committee</option>
					</Select>
				</div>
			</section>

			<Divider className="my-10" soft />

			<section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
				<div className="space-y-1">
					<Subheading>Committee Visibility</Subheading>
					<Text>If the committee is set as visible </Text>
				</div>
				<div className="flex">
					<Select className="my-auto" defaultValue={selectedCommittee?.isVisible ? "true" : "false"} required name="isVisible">
						<option value="true">Visible</option>
						<option value="false">Hidden</option>
					</Select>
				</div>
			</section>

			<Divider className="my-10" soft />

			<div className="flex justify-end gap-4">
				<Button form="committee-settings" type="reset" plain>
					Reset
				</Button>
				<Button form="committee-settings" type="submit">
					Save
				</Button>
			</div>

			<Divider className="my-10" soft />

			<section className="grid grid-cols-1 gap-x-8 gap-y-6">
				<div className="flex flex-col gap-4 md:flex-row">
					<div>
						<Subheading>Extra Countries or Entities</Subheading>
						<Text>
							Extra countries that can be assigned to delegates within the committee. e.g. &quot;European Union <em>(EU)</em>&quot;, &quot;Soviet
							Union <em>(USSR)</em>, &quot;World Health Organization <em>(WHO)</em>&quot;.
							<br />
							<em>Max 20</em>
						</Text>
					</div>
					<div className="flex">
						<SearchParamsButton searchParams={{ "add-extra-country": true }} className="my-auto w-full md:w-max">
							Add New
						</SearchParamsButton>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-2">
					{selectedCommittee?.ExtraCountry.map((extra) => {
						return (
							<div key={extra.id} className="rounded-md bg-zinc-50 p-2 px-4">
								<div className="flex">
									<div className="flex">
										<p className="my-auto text-sm font-medium text-zinc-800">
											<span className="mr-2">{extra.countryNameEn}</span>
											<Badge className="mr-2">{extra.countryCode}</Badge>
											{extra.isPowerToVeto && <Badge color="red">Veto Power</Badge>}
										</p>
									</div>
									<div className="ml-auto flex pl-3">
										<div className="my-2 flex gap-2">
											<button
												onClick={() => {
													updateSearchParams({ "edit-extra-country": extra.id }, router);
													router.refresh();
												}}
												type="button"
												className="my-auto inline-flex rounded-md bg-zinc-50 p-1.5 text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
												<span className="sr-only">Edit</span>
												<Ellipsis width={18} />
											</button>
											<button
												onClick={() => deleteCommitteeHandler(extra.id)}
												type="button"
												className="my-auto inline-flex rounded-md bg-zinc-50 p-1.5 text-zinc-500 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50">
												<span className="sr-only">Dismiss</span>
												<X aria-hidden="true" className="h-5 w-5" />
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</form>
	);
}
