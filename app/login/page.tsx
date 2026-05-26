import { redirect } from "next/navigation";

/**
 * Sign-in lives on `/account` (tabs). This URL exists for links and redirects.
 */
export default function LoginPage() {
  redirect("/account");
}
