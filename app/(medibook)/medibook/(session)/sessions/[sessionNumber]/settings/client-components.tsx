"use client";
import { Button } from "@heroui/button";
import { Divider } from "@/components/divider";
import { Subheading } from "@/components/heading";
import { Input } from "@/components/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "@/components/listbox";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { countries } from "@/data/countries";
import { entityCase } from "@/lib/text";
import { useEffect, useState } from "react";
import {
  releaseCertificates,
  revokeCertificates,
  sessionCountriesChange,
  sessionNumbersChange,
  setCurrentSession,
  setHidden,
  setMainShown,
  setVisible,
  updateSession,
  updateSessionPrices,
  updateSessionTexts,
} from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/badge";
import { authorize, s } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { permamentSCMembers } from "@/data/constants";

export function SettingsForm({ selectedSession }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(selectedSession?.theme);
  const [subTheme, setSubTheme] = useState(selectedSession?.subTheme);
  const { data: authSession } = useSession();
  const [selectedGACountries, setSelectedGACountries] = useState(selectedSession?.countriesOfSession?.join(","));
  const [selectedSCCountries, setSelectedSCCountries] = useState(
    selectedSession?.securityCouncilCountriesOfYear.join(","),
  );
  const [mounted, setMounted] = useState(false);

  function handleThemeChange(value) {
    let newValue = entityCase(value);
    setTheme(newValue);
  }

  function handleSubThemeChange(value) {
    let newValue = entityCase(value);
    setSubTheme(newValue);
  }

  function resetThemesForm() {
    setTheme(selectedSession?.theme);
    setSubTheme(selectedSession?.subTheme);
  }

  async function handleSubmitThemesForm(formData) {
    if (isLoading) return;
    setIsLoading(true);
    const res = await updateSession(formData, selectedSession.number);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSubmitTextsForm(formData) {
    if (isLoading) return;
    setIsLoading(true);
    const res = await updateSessionTexts(formData, selectedSession.number);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleReleaseCertificates() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await releaseCertificates({
      sessionId: selectedSession.id,
      notify: false,
    });
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleReleaseCertificatesAndNotify() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await releaseCertificates({
      sessionId: selectedSession.id,
      notify: true,
    });
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleRevokeCertificates() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await revokeCertificates({ sessionId: selectedSession.id });
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSubmitPricesForm(formData) {
    if (isLoading) return;
    setIsLoading(true);
    const res = await updateSessionPrices(formData, selectedSession.number);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSessionNumbersChange(formData) {
    if (isLoading) return;
    setIsLoading(true);
    const res = await sessionNumbersChange(formData, selectedSession.number);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSessionCountriesChange(formData) {
    setIsLoading(true);
    formData.set("generalAssemblyCountries", selectedGACountries);
    formData.set("securityCouncilCountriesOfYear", selectedSCCountries);
    const res = await sessionCountriesChange(formData, selectedSession.number);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSetCurrent() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await setCurrentSession(selectedSession.id);
    if (res?.ok) {
      router.refresh();
      toast.success(...res?.message);
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  async function handleSetMainShown() {
    setIsLoading(true);
    const res = await setMainShown(selectedSession.id);
    if (res?.ok) {
      router.refresh();
      toast.success(res?.message);
    } else {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleSetVisible() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await setVisible(selectedSession.id);
    if (res?.ok) {
      router.refresh();
      toast.success(...res?.message);
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  async function handleSetHidden() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await setHidden(selectedSession.id);
    if (res?.ok) {
      router.refresh();
      toast.success(...res?.message);
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  function handleSessionCountriesChangeListbox(value) {
    value = value.toUpperCase().replace(/[^A-Z,\n]/g, "");

    value = value
      .split(/[\n,]+/)
      .map((e) => e.trim().slice(0, 2))
      .join(",");

    setSelectedGACountries(value);
  }

  function handleSessionSCCountriesChangeListbox(value) {
    value = value.toUpperCase().replace(/[^A-Z,\n]/g, "");
    //remove permament SC members
    value = value
      .split(/[\n,]+/)
      .filter((e) => !permamentSCMembers?.includes(e?.trim()?.slice(0, 2)))
      .join(",");
    //add permament SC members to beginning
    value = permamentSCMembers?.join(",") + "," + value;
    //get the first 20 countries
    value = value
      .split(/[\n,]+/)
      .slice(0, 20)
      .join(",");

    setSelectedSCCountries(value);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "Loading..."; //fixLoad

  return (
    <div className="mx-auto max-w-5xl">
      <form action={handleSubmitThemesForm} id="themes">
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Theme</Subheading>
            <Text>
              The theme will appear everywhere including the website and certificates. A theme is required for a session
              to be made current and can&apos;t be removed after a theme is made current.
              <br />
              {theme !== selectedSession.theme && (
                <>
                  <span className="animate-appearance-in text-red-500">
                    Changing the theme will automatically update all certificates, the website and all other places
                    where it apears.
                  </span>
                  <br />
                </>
              )}
              <em>Min 10, Max 35 characters</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1 gap-6">
            <Input
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              maxLength={50}
              minLength={10}
              placeholder="Adapting to Today's Tomorrow..."
              name="theme"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Sub-Theme</Subheading>
            <Text>
              The subtheme will appear everywhere including the website and certificates. It should be a short phrase
              that complements the theme.
              <br />
              {subTheme !== selectedSession.subTheme && (
                <>
                  <span className="animate-appearance-in text-red-500">
                    Changing the sub-theme will automatically update all certificates, the website and all other places
                    where it apears.
                  </span>
                  <br />
                </>
              )}
              <em>Min 10, Max 50 characters</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1">
            <Input
              value={subTheme}
              onChange={(e) => handleSubThemeChange(e.target.value)}
              minLength={10}
              maxLength={50}
              placeholder={"Diplomacy in a Divided World..."}
              name="subTheme"
            />
          </div>
        </section>
      </form>
      <Divider className="my-10" soft />
      <div className="flex justify-end gap-4">
        <Button form="themes" onPress={resetThemesForm} variant="light" type="reset">
          Cancel
        </Button>
        <Button form="themes" type="submit">
          Save
        </Button>
      </div>
      <Divider className="my-10" soft />
      <form action={handleSubmitTextsForm} id="texts">
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Welcome Text</Subheading>
            <Text>
              The subtheme will appear everywhere including the website and certificates. It should be a short phrase
              that complements the theme.
              <br />
              <em>Max 500 characters</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1">
            <Textarea
              defaultValue={selectedSession?.welcomeText}
              maxLength={500}
              name="welcomeText"
              required={selectedSession.isCurrent || selectedSession.isPublished}
              className="min-h-36"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Description</Subheading>
            <Text>
              The theme will appear everywhere including the website and certificates. A theme is required for a session
              to be made current and can&apos;t be removed after a theme is made current.
              <br />
              <em>Max 500 characters</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1 gap-6">
            <Textarea
              defaultValue={selectedSession?.description}
              maxLength={500}
              name="description"
              className="min-h-36"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>About Session</Subheading>
            <Text>
              The subtheme will appear everywhere including the website and certificates. It should be a short phrase
              that complements the theme.
              <br />
              <em>Max 2000 characters</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1">
            <Textarea defaultValue={selectedSession?.about} maxLength={2000} name="about" className="min-h-36" />
          </div>
        </section>
      </form>
      <Divider className="my-10" soft />
      <div className="flex justify-end gap-4">
        <Button form="texts" variant="flat" type="reset">
          Cancel
        </Button>
        <Button type="submit" form="texts">
          Save
        </Button>
      </div>
      <Divider className="my-10" soft />
      {/* @ts-ignore Server Action */}
      {authorize(authSession, [s.admins, s.sd, s.director]) && (
        <>
          <form action={handleSubmitPricesForm} id="prices">
            <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Subheading>School Director Price</Subheading>
                <Text>
                  The price each school director has to pay to participate in the session. This price will be used to
                  calculate the total price for the school. Can&apos;t be changed after the session is made current or
                  is made fully visible.
                  <br />
                  <em>Min 1€, Max 9999€</em>
                </Text>
              </div>
              <div className="my-auto grid grid-cols-1">
                <Input
                  defaultValue={selectedSession?.directorPrice}
                  min={1}
                  max={9999}
                  type="number"
                  name="directorPrice"
                  disabled={!authorize(authSession, [s.admins, s.sd, s.director])}
                />
              </div>
            </section>
            <Divider className="my-10" soft />
            <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                <Subheading>Delegate Price</Subheading>
                <Text>
                  The price each delegate has to pay to participate in the session. This price will be used to calculate
                  the total price for the school. Can&apos;t be changed after the session is made current or is made
                  fully visible.
                  <br />
                  <em>Min 1€, Max 9999€</em>
                </Text>
              </div>
              <div className="my-auto grid grid-cols-1 gap-6">
                <Input
                  defaultValue={selectedSession?.delegatePrice}
                  min={1}
                  max={9999}
                  type="number"
                  name="delegatePrice"
                  disabled={!authorize(authSession, [s.admins, s.sd, s.director])}
                />
              </div>
            </section>
          </form>
          <Divider className="my-10" soft />
          <div className="flex justify-end gap-4">
            <Button form="prices" variant="flat" type="reset">
              Cancel
            </Button>
            <Button type="submit" form="prices" disabled={!authorize(authSession, [s.admins, s.sd, s.director])}>
              Save
            </Button>
          </div>
          <Divider className="my-10" soft />
        </>
      )}
      <form action={handleSessionNumbersChange} id="handleSessionNumbersChange">
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Minimum Delegate Age</Subheading>
            <Text>
              The minimum age a delegate must be to participate in the session. Calculated based on the first conference
              day.
              <br />
              <em>Min 1, Max 99</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1">
            <Input
              defaultValue={selectedSession?.minimumDelegateAgeOnFirstConferenceDay}
              min={1}
              max={99}
              type="number"
              name="minimumDelegateAgeOnFirstConferenceDay"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Maximun Delegate Age</Subheading>
            <Text>
              The maximun age a delegate must be to participate in the session. Calculated based on the first conference
              day.
              <br />
              <em>Min 1, Max 99</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1">
            <Input
              defaultValue={selectedSession?.maximumDelegateAgeOnFirstConferenceDay}
              min={1}
              max={99}
              type="number"
              name="maximumDelegateAgeOnFirstConferenceDay"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Maximum number of General Assembly Delegations</Subheading>
            <Text>
              The maximum number of General Assembly delegations a school can bring to the session. Depending on the
              number of General Assembly committees in the sessions this number corresponds to a different number of
              delegates calculated by multiplying the number of General Assembly committees in the session by the number
              delegations in the session.
              <br />
              <em>Min 1, Max 500</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1 gap-6">
            <Input
              defaultValue={selectedSession?.maxNumberOfGeneralAssemblyDelegationsPerSchool}
              min={1}
              max={500}
              type="number"
              name="maxNumberOfGeneralAssemblyDelegationsPerSchool"
            />
          </div>
        </section>
        <Divider className="my-10" soft />
        <div className="flex justify-end gap-4">
          <Button form="handleSessionNumbersChange" variant="flat" type="reset">
            Cancel
          </Button>
          <Button type="submit" form="handleSessionNumbersChange">
            Save
          </Button>
        </div>
      </form>
      <form id="handleSessionCountriesChange" action={handleSessionCountriesChange}>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>
              General Assembly Countries of Session
              <Badge color="yellow" className="ml-1">
                Level 1 Danger Zone
              </Badge>
            </Subheading>
            <Text>
              The countries that will be available for General Assembly Delegations in the session. If you change this{" "}
              <u>and remove countries</u> after the applications are opened it will cause some applicatons using the old
              list to be invalid. You can select countries from the list or input the two-digit country codes as a comma
              or new-line separated list.
              <br />
              <em>Min 1, Max 500</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1 gap-6">
            <Textarea
              value={selectedGACountries}
              onChange={(e) => handleSessionCountriesChangeListbox(e.target.value)}
            />
            <Listbox
              placeholder="Country"
              multiple
              value={selectedGACountries?.split(/[\n,]+/)?.map((e) => e?.trim()?.slice(0, 2))}
              onChange={(e) => setSelectedGACountries(e.join(","))}
            >
              {countries.map((country) => (
                <ListboxOption key={country.countryCode} value={country.countryCode}>
                  <p>{country.flag}</p>
                  <ListboxLabel>{country.countryNameEn}</ListboxLabel>
                  {selectedSession.securityCouncilCountriesOfYear.includes(country.countryCode) && (
                    <ListboxDescription>UNSC Member</ListboxDescription>
                  )}
                </ListboxOption>
              ))}
            </Listbox>
            <Text>
              {selectedGACountries
                ?.split(/[\n,]+/)
                ?.filter((e) => countries?.map((country) => country?.countryCode)?.includes(e?.trim()?.slice(0, 2)))
                .length || "None"}
              {" Selected"}
            </Text>
          </div>
        </section>
        <Divider className="my-10" soft />
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Security Council Countries of Year</Subheading>
            <Text>
              The countries that will be available for Security Council Delegations in the session. If you need to add
              options such as the USSR to the Security Council or to the Special Committees you can do so in the
              respective Committees&apos; settings. You can select countries from the list or input the two-digit
              country codes as a comma or new-line separated list.
              <br />
              <em>Select 20 Values</em>
            </Text>
          </div>
          <div className="my-auto grid grid-cols-1 gap-6">
            <Textarea
              value={selectedSCCountries}
              onChange={(e) => handleSessionSCCountriesChangeListbox(e.target.value)}
            />
            <Listbox
              placeholder="Country"
              multiple
              value={selectedSCCountries?.split(/[\n,]+/)?.map((e) => e?.trim()?.slice(0, 2))}
              onChange={(e) => setSelectedSCCountries(e.splice(0, 20).join(","))}
            >
              {countries
                .sort(
                  (a, b) => permamentSCMembers?.includes(b?.countryCode) - permamentSCMembers?.includes(a?.countryCode),
                )
                .map((country) => (
                  <ListboxOption
                    key={country.countryCode}
                    disabled={permamentSCMembers?.includes(country?.countryCode)}
                    value={country.countryCode}
                  >
                    <img
                      className="w-5 sm:w-4"
                      src={`https://flagcdn.com/40x30/${country.countryCode.toLowerCase()}.webp`}
                      alt=""
                    />
                    <ListboxLabel>{country.countryNameEn}</ListboxLabel>
                  </ListboxOption>
                ))}
            </Listbox>
            <Text>
              {selectedSCCountries
                ?.split(/[\n,]+/)
                ?.filter((e) => countries?.map((country) => country?.countryCode)?.includes(e?.trim()?.slice(0, 2)))
                .length || "None"}
              {" Selected"}
            </Text>
          </div>
        </section>
      </form>
      <Divider className="my-10" soft />
      <div className="flex justify-end gap-4">
        <Button type="submit" form="handleSessionCountriesChange">
          Save
        </Button>
      </div>

      <Divider className="my-10" soft />

      {authorize(authSession, [s.admins, s.sd]) && (
        <form id="dangerousActions">
          <div className="flex flex-col gap-6 rounded-[4px] border-l-4 border-red-500/30 bg-red-500/10 p-4">
            <section className="m-2 flex flex-col gap-6">
              <SessionActionList
                title="Set Session as Visible"
                bullets={[
                  "The session will be visible to everyone",
                  "Set a session as visible after all committees, days, topics, and application deadlines have been added to it.",
                ]}
              />
              <ButtonGroup className="ml-auto">
                <Button
                  type="button"
                  isDisabled={selectedSession.isVisible && selectedSession.isMainShown}
                  onPress={selectedSession.isVisible ? handleSetHidden : handleSetVisible}
                >
                  {selectedSession.isVisible ? "Hide" : "Set as Visible"}
                </Button>
              </ButtonGroup>
            </section>

            <section className="m-2 flex flex-col gap-6">
              <SessionActionList
                title="Set Current Session & Current Secretariat"
                bullets={[
                  "The current secretariat will lose their powers and new secretariat will gain secretariat powers.",
                  "This does not effect which session is shown as the main session on the website.",
                ]}
              />
              <ButtonGroup className="ml-auto">
                <Button
                  color="danger"
                  type="button"
                  onPress={handleSetCurrent}
                  isDisabled={selectedSession.isCurrent}
                  className="md:ml-auto md:max-w-max"
                >
                  Set Session as Current
                </Button>
              </ButtonGroup>
            </section>

            <section className="m-2 flex flex-col gap-6">
              <SessionActionList
                title="Set Session as Mainly Shown"
                bullets={[
                  "The session will be the one that appears on the main website and the session will appear at the top of the session list everywhere.",
                  "This does not effect which session is the current session.",
                ]}
              />
              <ButtonGroup className="ml-auto">
                <Button type="button" isDisabled={selectedSession.isMainShown} onPress={handleSetMainShown}>
                  {selectedSession.isMainShown ? "Already Mainly Shown" : "Set as Mainly Shown"}
                </Button>
              </ButtonGroup>
            </section>
          </div>

          <Divider className="my-10" soft />

          <div className="rounded-[4px] border-l-4 border-yellow-500/30 bg-yellow-500/10 p-4">
            <section id="certificates" className="m-2 flex flex-col gap-6">
              {!selectedSession.publishCertificates ? (
                <>
                  <SessionActionList
                    title="Release Certificates"
                    bullets={[
                      "All generated certificates will be available for view.",
                      "Certificates will be verifiable through the QR code on them.",
                      "Certificates generated after this has been activated will be sent out automatically.",
                    ]}
                  />
                  <ButtonGroup className="ml-auto">
                    <Button type="button" color="warning" onPress={handleReleaseCertificates}>
                      Release Certificates
                    </Button>
                    <Button color="warning" type="button" onPress={handleReleaseCertificatesAndNotify}>
                      Release Certificates & Notify Users
                    </Button>
                  </ButtonGroup>
                </>
              ) : (
                <>
                  <SessionActionList
                    title="Revoke Certificates"
                    bullets={[
                      "All generated certificates will be not available for view.",
                      "Certificates will not be verifiable through the QR code on them.",
                    ]}
                  />
                  <ButtonGroup className="ml-auto">
                    <Button color="warning" type="button" onPress={handleRevokeCertificates}>
                      Revoke Certificates
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </section>
          </div>
        </form>
      )}
    </div>
  );
}

function SessionActionList({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="space-y-1">
      <Subheading>{title}</Subheading>
      <ul className="list-disc text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
        {bullets.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

function ButtonGroup({ children }) {
  return <div className="ml-auto flex flex-wrap justify-end gap-2">{children}</div>;
}
