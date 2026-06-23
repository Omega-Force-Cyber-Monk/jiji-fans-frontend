import Container from "@/components/Container";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Delete Your Anstop Covoiturage Account",
    description:
      "Learn how to request deletion of your Anstop Covoiturage account, what data is removed, what is retained, and how long data may be kept for legal reasons.",
  };
}

const deleteSteps = [
  "Open the Anstop Covoiturage app and log in to the account you want to delete.",
  "Open the side drawer and go to Settings.",
  'Tap "Delete Account".',
  "Read the warning carefully, then confirm the deletion request.",
];

const deletedData = [
  "Profile information such as your name, email address, and phone number.",
  "Ride history and trip records linked to your account.",
  "Wallet balance and wallet records associated with the account.",
];

const retainedData = [
  "Data required to meet legal, tax, accounting, or regulatory obligations.",
  "Fraud prevention and security records.",
  "Support messages and other records needed to resolve disputes or comply with law.",
];

const Page = () => {
  return (
    <main className="bg-[#F5F7FB]">
      <Container className="relative overflow-hidden bg-[#0E1320] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(64,196,255,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,144,74,0.18),_transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Public account deletion request page
            </div>
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Delete your Anstop Covoiturage account
              </h1>
              <p className="text-base leading-7 text-white/80 sm:text-lg">
                If you no longer want to use Anstop Covoiturage, you can request
                deletion from inside the app or by email. Once your account is
                deleted, you will no longer be able to sign in with that account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:contact.anstop@gmail.com?subject=Delete%20my%20Anstop%20Covoiturage%20account"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                Request deletion by email
              </a>
              <a
                href="#how-to-delete"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the steps
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
                Summary
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                    How to request deletion
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Use the in-app Delete Account option in Settings, or email us
                    if you cannot access the app.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                    Data removed
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Profile, ride history, and wallet data associated with the
                    account are deleted when the request is processed.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                    Data retained
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Some information may be kept for up to 90 days for legal,
                    fraud prevention, and dispute resolution purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="bg-white">
        <div className="grid gap-6 lg:grid-cols-2">
          <section
            id="how-to-delete"
            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              How to delete your account
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              In-app deletion steps
            </h2>
            <ol className="mt-5 space-y-4">
              {deleteSteps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              What happens next
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Data we delete and data we keep
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Deleted data
                </h3>
                <ul className="mt-3 space-y-3">
                  {deletedData.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Retained data
                </h3>
                <ul className="mt-3 space-y-3">
                  {retainedData.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-700">
                  Retention period
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Some information may be retained for up to 90 days after your
                  deletion request is processed. We keep only the minimum data
                  needed for legal compliance, fraud prevention, accounting, and
                  dispute handling.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-[#0E1320] p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Need help?
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Contact the Anstop Covoiturage team
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
                If you are unable to delete your account from the app, or if you
                need help with the deletion request, email us and include the
                account email address associated with your Anstop Covoiturage
                profile.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="mailto:contact.anstop@gmail.com"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                contact.anstop@gmail.com
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Return to home
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
};

export default Page;
