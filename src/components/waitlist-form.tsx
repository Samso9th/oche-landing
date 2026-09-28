import clsx from "clsx";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { API_URL, APP_URL } from "../links.ts";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

const field =
  "h-12 w-full min-w-0 rounded-xl bg-surface-2/80 px-4 text-[15px] text-ink shadow-[inset_0_1px_0_rgb(255_245_235/0.04),0_0_0_1px_var(--line-strong)] outline-none transition-shadow duration-150 placeholder:text-faint focus:shadow-[0_0_0_1px_rgb(255_106_66/0.6),0_0_0_4px_rgb(255_106_66/0.15)]";

/** Email plus an optional GitHub username, posted to the server's public /waitlist. */
export function WaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind === "sending") return;
    setState({ kind: "sending" });
    try {
      const res = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, github, website }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ kind: "error", message: body.error ?? "Something went wrong. Try again in a minute." });
        return;
      }
      setState({ kind: "done" });
    } catch {
      setState({ kind: "error", message: "Couldn't reach Oche. Check your connection and try again." });
    }
  };

  if (state.kind === "done")
    return (
      <div className={clsx("swap mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-prod/10 p-5 text-left shadow-[0_0_0_1px_rgb(61_220_132/0.25)]", className)}>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-prod text-bg">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <div className="text-[14.5px] leading-relaxed">
          <p className="font-medium text-ink">You're on the list.</p>
          <p className="mt-1 text-ink-2">
            When you're let in, sign in at <a href={APP_URL} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">{APP_URL.replace(/^https?:\/\//, "")}</a> with {github.trim() ? "that GitHub account" : "your GitHub account"}.
          </p>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className={clsx("mx-auto w-full max-w-xl", className)} noValidate={false}>
      <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_auto]">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email"
          autoComplete="email"
          className={field}
        />
        <input
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          placeholder="GitHub username"
          aria-label="GitHub username (optional)"
          autoComplete="off"
          spellCheck={false}
          className={clsx(field, "font-mono text-[14px] placeholder:font-sans placeholder:text-[15px]")}
        />
        {/* Hidden from people; bots fill it in and get quietly ignored. */}
        <input tabIndex={-1} aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" autoComplete="off" className="absolute -left-[9999px] size-px opacity-0" />
        <button
          type="submit"
          disabled={state.kind === "sending"}
          className="pressable group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ember px-5 text-[15px] font-medium whitespace-nowrap text-ember-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_0_0_1px_rgb(255_106_66/0.5),0_10px_32px_-8px_rgb(255_106_66/0.65)] hover:brightness-[1.08] disabled:opacity-80"
        >
          {state.kind === "sending" ? <Loader2 className="spin size-4" /> : null}
          Join the waitlist
          {state.kind !== "sending" && <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />}
        </button>
      </div>
      <p className={clsx("mt-3 text-[13px]", state.kind === "error" ? "text-danger" : "text-muted")} aria-live="polite">
        {state.kind === "error" ? state.message : "Your GitHub username is optional, but it's what gets you in."}
      </p>
    </form>
  );
}
