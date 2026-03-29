import { CommunityJoinCta } from "@/components/CommunityJoinCta";
import { getUser } from "@/lib/auth";

const benefits = [
  "Live trade alerts",
  "Pre-market briefings",
  "Expert Q&A",
  "Risk management guidance",
];

export default async function CommunityPage() {
  const user = await getUser();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="font-heading text-4xl text-white">Community</h1>
      <p className="mt-2 text-zinc-400">Join the free trading room and stay accountable with real-time updates.</p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => (
          <article key={benefit} className="rounded-xl border border-white/10 bg-[#111111] p-5">
            <p className="text-white">{benefit}</p>
          </article>
        ))}
      </section>

      <div className="mt-10">
        <CommunityJoinCta isAuthenticated={Boolean(user)} />
      </div>
    </main>
  );
}
