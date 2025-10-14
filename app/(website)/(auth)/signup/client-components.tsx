"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Description, Field, Label } from "@/components/fieldset";
import { Text, TextLink } from "@/components/text";
import { approveHalfUser, checkEmail, createNewUser, createPendingUser } from "./actions";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import Confetti from "react-confetti";
import useWindowDimensions from "@/hooks/use-window-dimentions";
import { Badge } from "@/components/badge";
import { Select } from "@/components/select";
import { updateSearchParams } from "@/lib/search-params";
import { Input } from "@heroui/input";
import { flushSync } from "react-dom";
import { XCircleIcon } from "lucide-react";

export function SignUpForm({ allowSignUp }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const verificationCodeId = searchParams?.get("verificationCodeId") || "";
  const [showPersonalEmailError, setShowPersonalEmailError] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [schools, setSchools] = useState([]);
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { width, height } = useWindowDimensions();
  const stage = searchParams && searchParams.get("stage") ? searchParams.get("stage") : "START";

  function setStage(newStage) {
    updateSearchParams({ stage: newStage });
  }

  function setVerificationCodeId(id) {
    updateSearchParams({ verificationCodeId: id });
  }

  async function handleStage1() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await checkEmail(email);

    const data = res?.data;
    if (data.stage == "USER_WITH_ACCOUNT") {
      toast.info(...res?.message);
      router.push("/login");
    }
    if (data?.stage == "USER_WITHOUT_ACCOUNT") {
      setStage("USER_WITHOUT_ACCOUNT");
    }
    if (data?.stage == "BLACKLIST") {
      setStage("BLACKLIST");
    }
    if (data.stage == "NO_USER") {
      setStage("NO_USER");
      setSchools(data?.schools ? data.schools : []);
    }
    if (!res?.ok) {
      toast.error(res?.message);
    }
    setIsLoading(false);
  }

  async function handleHalfVerifyEmail() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await approveHalfUser(email, verificationCode, password);
    if (res?.ok) {
      setStage("HALF_ACCOUNT_CREATED");
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  async function handleCreateNewPendingUser(formData: FormData) {
    if (isLoading) return;
    setIsLoading(true);
    const res = await createPendingUser(formData, email);
    if (res?.ok) {
      setStage(res?.data?.stage);
      setVerificationCodeId(res?.data?.id);
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  async function handleCreateNewUser() {
    if (isLoading) return;
    setIsLoading(true);
    const res = await createNewUser(verificationCodeId, password, verificationCode);
    if (res?.ok) {
      setStage(res?.data?.stage);
    } else {
      toast.error(...res?.message);
    }
    setIsLoading(false);
  }

  const isPasswordAtLeast8Characters = password.length >= 8;
  const isPasswordContainUppercase = /[A-Z]/.test(password);
  const isPasswordContainLowercase = /[a-z]/.test(password);
  const isPasswordContainNumber = /[0-9]/.test(password);
  const isPasswordContainSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  const isPasswordValid =
    isPasswordAtLeast8Characters &&
    isPasswordContainUppercase &&
    isPasswordContainLowercase &&
    isPasswordContainNumber &&
    isPasswordContainSpecialCharacter;
  const doPasswordsMatch = password === confirmPassword;

  return (
    <>
      {stage === "START" && (
        <form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
          <Field>
            <Label>Email</Label>
            <Description className="mb-2">
              <span className="text-md">
                If you’ve attended before, please use the same email address you registered with or the one provided by
                your school during your previous session registration.
              </span>
            </Description>
            {showPersonalEmailError && (
              <div className="text-md mb-4 rounded-md bg-red-50 p-4 dark:bg-red-500/15 dark:outline-1 dark:outline-red-500/25">
                <div className="flex">
                  <div className="shrink-0">
                    <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Please use your personal email.
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <Input
              onChange={(e) => {
                let processed = e.target.value.trim().toLowerCase();
                if (processed.includes("englishschool.ac.cy")) setShowPersonalEmailError(true);

                if (processed.length > 100) {
                  toast.error("Email cannot be longer than 100 characters.");
                  processed = processed.slice(0, 100);
                }
                setEmail(processed.replace(/englishschool\.ac\.cy/g, ""));
              }}
              value={email}
              name="email"
              variant="bordered"
              type="email"
              placeholder="user@email.com"
            />
          </Field>
          <div className="mt-4 rounded-lg bg-zinc-300/50 p-2">
            <CheckboxField>
              <Label className="text-[12px]! leading-[16px]!">
                I Accept the <TextLink href="/terms">Terms of Service</TextLink>, the{" "}
                <TextLink href="/privacy">Privacy Policy</TextLink> and the{" "}
                <TextLink href="/conduct">Code of Conduct</TextLink>
              </Label>
              <Checkbox
                onChange={(val) => setAcceptedTerms(val)}
                checked={acceptedTerms}
                className="animate-appearance-in delay-200"
              />
            </CheckboxField>
          </div>
          <Button
            className="mt-5 w-full"
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={isLoading || !acceptedTerms || !email.trim() || allowSignUp == "false"}
          >
            {allowSignUp == "false" ? "Sign Up is disabled" : "Continue"}
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-6 flex w-full justify-between p-3">
            <p className="text-xs">Already have an account?</p>
            <Link href="/login" className="text-primary text-xs">
              Log In
            </Link>
          </div>
        </form>
      )}
      {stage === "BLACKLIST" && (
        <div className="flex h-[calc(100%-56px)] flex-col">
          <div className="space-y-8">
            <Text>
              Unfortunately, your account appears to be blacklisted and you are unable to proceed with registration. If
              you think this is a mistake, please <TextLink href="/contact">contact us</TextLink>. If you try to
              register with a different email address, you will be redirected again.
            </Text>
            <Button className="w-full" onPress={() => setStage("START")} color="primary">
              Back to Sign Up
            </Button>
          </div>
        </div>
      )}
      {stage === "USER_WITHOUT_ACCOUNT" && (
        <form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
          <Text className="mt-5">
            It looks like you&apos;ve attended before. Please create a password and to continue.
          </Text>
          <Field className="mt-5">
            <Label>Password</Label>
            <ul className="mb-3 ml-4 mt-2 list-outside list-disc text-xs">
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordAtLeast8Characters && "text-green-500!")}
                as="li"
              >
                At least 8 characters long.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainUppercase && "text-green-500!")}
                as="li"
              >
                Must contain at least one uppercase letter.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainLowercase && "text-green-500!")}
                as="li"
              >
                Must contain at least one lowercase letter.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainNumber && "text-green-500!")}
                as="li"
              >
                Must contain at least one number.
              </Text>
              <Text
                className={cn(
                  "text-xs! text-primary! duration-150",
                  isPasswordContainSpecialCharacter && "text-green-500!",
                )}
                as="li"
              >
                Must contain at least one special character.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", doPasswordsMatch && password && "text-green-500!")}
                as="li"
              >
                Passwords must match.
              </Text>
            </ul>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="animate-appearance-in delay-150"
              name="password"
              type="password"
              placeholder="Password"
            />
          </Field>
          <Input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            className="animate-appearance-in mt-5 delay-200"
            name="password"
            type="password"
            placeholder="Confirm Password"
          />
          <Button
            onPress={() => setStage("USER_WITHOUT_ACCOUNT_EMAIL_VERIFICATION")}
            className="mt-5 w-full"
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={!isPasswordValid || !doPasswordsMatch || isLoading}
          >
            Continue
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-auto flex w-full justify-between p-3">
            <p className="text-xs">Entered an incorrect email?</p>
            <Link href="/login" className="text-primary text-xs">
              Start Over
            </Link>
          </div>
        </form>
      )}
      {stage === "NEW_PENDING_USER_EMAIL_PASSWORD" && (
        <form className="flex h-[calc(100%-56px)] flex-col">
          <Text className="mt-5">Create a password.</Text>
          <Field className="mt-5">
            <Label>Password</Label>
            <ul className="mb-3 ml-4 mt-2 list-outside list-disc text-xs">
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordAtLeast8Characters && "text-green-500!")}
                as="li"
              >
                At least 8 characters long.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainUppercase && "text-green-500!")}
                as="li"
              >
                Must contain at least one uppercase letter.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainLowercase && "text-green-500!")}
                as="li"
              >
                Must contain at least one lowercase letter.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", isPasswordContainNumber && "text-green-500!")}
                as="li"
              >
                Must contain at least one number.
              </Text>
              <Text
                className={cn(
                  "text-xs! text-primary! duration-150",
                  isPasswordContainSpecialCharacter && "text-green-500!",
                )}
                as="li"
              >
                Must contain at least one special character.
              </Text>
              <Text
                className={cn("text-xs! text-primary! duration-150", doPasswordsMatch && password && "text-green-500!")}
                as="li"
              >
                Passwords must match.
              </Text>
            </ul>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="animate-appearance-in delay-150"
              name="password"
              type="password"
              placeholder="Password"
            />
          </Field>
          <Input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            className="animate-appearance-in mt-5 delay-200"
            name="password"
            type="password"
            placeholder="Confirm Password"
          />
          <Button
            onPress={() => setStage("NEW_PENDING_USER_EMAIL_VERIFICATION")}
            className="mt-5 w-full"
            color="primary"
            isLoading={isLoading}
            isDisabled={!isPasswordValid || !doPasswordsMatch || isLoading}
          >
            Continue
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-auto flex w-full justify-between p-3">
            <p className="text-xs">Entered an incorrect email?</p>
            <Link href="/login" className="text-primary text-xs">
              Start Over
            </Link>
          </div>
        </form>
      )}
      {stage === "USER_WITHOUT_ACCOUNT_EMAIL_VERIFICATION" && (
        <form className="flex h-[calc(100%-56px)] flex-col" action={handleStage1}>
          <Field className="mt-8">
            <Label>Verify Your Email</Label>
            <Description>
              We’ve sent a verification email code to your email. Please check your inbox and enter the code below to
              continue. The code is valid for 10 minutes. If you haven’t received the email, please check your spam
              folder or contact us so that we can directly verify your email.
            </Description>
            <Input
              maxLength={6}
              minLength={6}
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
            ></Input>
          </Field>
          <Button
            className="mt-5 w-full"
            onPress={handleHalfVerifyEmail}
            color="primary"
            isLoading={isLoading}
            isDisabled={isLoading || verificationCode.length !== 6}
          >
            Continue
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-4 flex w-full justify-between p-3">
            <p className="text-xs">Entered an incorrect email?</p>
            <span onClick={() => setStage("START")} className="text-primary cursor-pointer text-xs">
              Start Over
            </span>
          </div>
        </form>
      )}
      {stage === "NO_USER" && (
        <form className="flex h-full flex-col gap-5" action={handleCreateNewPendingUser}>
          <Field className="animate-appearance-in delay-100">
            <Label>
              Official Name <Badge color="red">Required</Badge>
            </Label>
            <Description>
              <span className="text-xs">
                Your name as it appears on your passport. You can change this later in settings. You can also add a
                preferred name later in account settings.
              </span>
            </Description>
            <Input variant="bordered" className="mt-4" name="officialName" />
          </Field>
          <Field className="animate-appearance-in delay-300">
            <Label>
              Official Surname <Badge color="red">Required</Badge>
            </Label>
            <Description>
              <span className="text-xs">
                Your surname as it appears on your passport. You can change this later in account settings.
              </span>
            </Description>
            <Input variant="bordered" className="mt-4" name="officialSurname" />
          </Field>
          <Field className="animate-appearance-in delay-500">
            <Label>School</Label>
            <Description>
              <span className="text-xs">
                You need to have a school selected to be able to attend the conference. You can change this later in
                settings.
              </span>
            </Description>
            <Select defaultValue="null" className="animate-appearance-in mt-5" name="schoolId">
              <option value="null">None</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            className="animate-appearance-in mt-5 w-full delay-700"
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            Continue
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-auto flex w-full justify-between p-3 delay-1000">
            <p className="text-xs">Entered an incorrect email?</p>
            <span onClick={() => setStage("START")} className="text-primary text-xs">
              Start Over
            </span>
          </div>
        </form>
      )}
      {stage === "NEW_PENDING_USER_EMAIL_VERIFICATION" && (
        <form className="flex h-[calc(100%-56px)] flex-col">
          <Field className="mt-8">
            <Label>Verify Your Email</Label>
            <Description>
              We’ve sent a verification email code to {email}. Please check your inbox and enter the code below to
              continue. The code is valid for 10 minutes. If you haven’t received the email, please check your spam
              folder or contact us so that we can directly verify your email.
            </Description>
            <Input
              maxLength={6}
              minLength={6}
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
            ></Input>
          </Field>
          <Button
            className="mt-5 w-full"
            onPress={handleCreateNewUser}
            color="primary"
            isLoading={isLoading}
            isDisabled={isLoading || verificationCode.length !== 6}
          >
            Continue
          </Button>
          <div className="animate-appearance-in rounded-small bg-content2 mt-auto flex w-full justify-between p-3">
            <p className="text-xs">Entered an incorrect email?</p>
            <span onClick={() => setStage("START")} className="text-primary cursor-pointer text-xs">
              Start Over
            </span>
          </div>
        </form>
      )}
      {stage === "NEW_ACCOUNT_CREATED" && (
        <div className="flex h-[calc(100%-56px)] flex-col">
          {width && height && <Confetti width={width} height={height} />}
          <Text className="mt-5">Your account has been created successfully.</Text>
          <div className="mt-8 space-y-8">
            <Text>
              You can now login to MediBook using your Email or User ID and Password. If you have any questions or need
              help, <TextLink href="/contact">contact us</TextLink>.
            </Text>
            <Button className="w-full" href="/login" color="primary">
              Log In
            </Button>
          </div>
        </div>
      )}
      {stage === "HALF_ACCOUNT_CREATED" && (
        <div className="flex h-[calc(100%-56px)] flex-col">
          {width && height && <Confetti width={width} height={height} />}
          <Text className="mt-5">Your account has been created successfully.</Text>
          <div className="mt-8 space-y-8">
            <Text>
              You can now login to MediBook using your Email or User ID and Password. If you have any questions or need
              help, <TextLink href="/contact">contact us</TextLink>.
            </Text>
            <Button className="w-full" href="/login" color="primary">
              Log In
            </Button>
          </div>
        </div>
      )}
      {/*       <span onClick={() => setStage("USER_WITHOUT_ACCOUNT_EMAIL_VERIFICATION")}>nnn</span>
       */}
    </>
  );
}
