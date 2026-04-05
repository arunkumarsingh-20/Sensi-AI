import Link from "next/link";
import { FileText, Plus, Sparkles, TriangleAlert } from "lucide-react";

import { getCoverLetters } from "@/actions/cover-letter";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const pageShellClass =
  "min-h-screen px-4 py-10 md:px-8 lg:px-12 xl:px-16";
const panelClass =
  "relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-8 lg:p-10";
const gradientClass =
  "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%)]";

function EmptyState({ title, description, actionHref, actionLabel }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <FileText className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        {description}
      </p>

      <Button
        asChild
        className="mt-6 rounded-full bg-cyan-400 px-6 text-black hover:bg-cyan-300"
      >
        <Link href={actionHref}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
        <TriangleAlert className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-2xl font-semibold text-white">
        Could not load cover letters
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        Please try again in a moment. If this keeps happening, the backend may be
        unavailable or your session may have expired.
      </p>

      <Button
        asChild
        className="mt-6 rounded-full bg-white px-6 text-black hover:bg-white/90"
      >
        <Link href="/ai-cover-letter/new">
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Link>
      </Button>
    </div>
  );
}

export default async function CoverLetterPage() {
  let coverLetters = [];

  try {
    const data = await getCoverLetters();
    coverLetters = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to load cover letters:", error);
    coverLetters = null;
  }

  return (
    <div className={pageShellClass}>
      <div className="mx-auto max-w-7xl">
        <section className={panelClass}>
          <div className={gradientClass} />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI Writing Workspace
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                My Cover Letters
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
                Create, refine, and manage personalized cover letters tailored
                to your target roles and companies with AI-powered assistance.
              </p>
            </div>

            <Button
              asChild
              className="h-11 rounded-full bg-white px-6 text-black hover:bg-white/90"
            >
              <Link href="/ai-cover-letter/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-8">
          {coverLetters === null ? (
            <ErrorState />
          ) : coverLetters.length > 0 ? (
            <CoverLetterList coverLetters={coverLetters} />
          ) : (
            <EmptyState
              title="No cover letters yet"
              description="Start your first draft with AI and build role-specific cover letters that feel polished, relevant, and ready to send."
              actionHref="/ai-cover-letter/new"
              actionLabel="Create Your First Cover Letter"
            />
          )}
        </section>
      </div>
    </div>
  );
}
