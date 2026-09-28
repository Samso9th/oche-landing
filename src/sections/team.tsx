import clsx from "clsx";
import { Card, Reveal, SectionHead } from "../components/ui.tsx";

const PEOPLE: { name: string; initials: string; hue: string; role: string; repos: { name: string; access: "admin" | "write" | "read" }[] }[] = [
  {
    name: "You",
    initials: "you",
    hue: "var(--ember)",
    role: "Owner · sees every repo",
    repos: [
      { name: "acme/storefront", access: "admin" },
      { name: "acme/api", access: "admin" },
      { name: "side/blog", access: "admin" },
    ],
  },
  {
    name: "tobi",
    initials: "TA",
    hue: "var(--dev)",
    role: "Member",
    repos: [
      { name: "acme/storefront", access: "write" },
      { name: "acme/api", access: "write" },
    ],
  },
  {
    name: "amaka",
    initials: "AE",
    hue: "var(--staging)",
    role: "Member",
    repos: [{ name: "acme/storefront", access: "read" }],
  },
];

export function Team() {
  return (
    <section id="team" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal i={2} className="order-2 lg:order-1">
          <Card className="divide-y divide-line">
            {PEOPLE.map((p) => (
              <div key={p.name} className="flex gap-4 p-5">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full font-mono text-[11.5px] font-medium text-bg"
                  style={{ background: p.hue }}
                >
                  {p.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink">
                    {p.name} <span className="font-normal text-muted">· {p.role}</span>
                  </p>
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {p.repos.map((r) => (
                      <li key={r.name} className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 py-1 pr-1 pl-2 font-mono text-[11.5px] text-ink-2 shadow-[0_0_0_1px_var(--line)]">
                        {r.name}
                        <span
                          className={clsx(
                            "rounded px-1 font-sans text-[10.5px]",
                            r.access === "read" ? "bg-surface-3 text-muted" : "bg-prod/15 text-prod",
                          )}
                        >
                          {r.access === "read" ? "can look" : "can ship"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </Card>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHead eyebrow="Teams" title="People see what GitHub says they can.">
            Add teammates by GitHub username. Each person sees only the repos and orgs their own account can reach, and needs write access to promote, ship or roll back.
            Oche checks with GitHub every 15 minutes.
          </SectionHead>
        </div>
      </div>
    </section>
  );
}
