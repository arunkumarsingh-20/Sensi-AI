import HeroSection from "@/components/Hero";
import { features } from "@/data/features";
import { howitWorks } from "@/data/howitWorks";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const stats = [
  { value: "50+", label: "Industries Covered" },
  { value: "1000+", label: "Interview Questions" },
  { value: "95%", label: "Success Rate" },
  { value: "24/7", label: "AI Support" },
];

const trustPoints = [
  "Personalized career guidance",
  "AI-generated resume support",
  "Interview practice with feedback",
  "Role-specific cover letters",
];

const SectionTitle = ({ eyebrow, title, description, align = "center" }) => (
  <div
    className={[
      "mx-auto mb-12 max-w-3xl",
      align === "left" ? "text-left" : "text-center",
    ].join(" ")}
  >
    {eyebrow ? (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
    ) : null}
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
    {description ? (
      <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
        {description}
      </p>
    ) : null}
  </div>
);

const FeatureCard = ({ feature }) => (
  <Card className="group border-border/60 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
    <CardContent className="flex h-full flex-col gap-4 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        {feature.icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </CardContent>
  </Card>
);

const StatCard = ({ value, label }) => (
  <Card className="border-border/50 bg-card/70 shadow-sm">
    <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="text-3xl font-bold tracking-tight md:text-4xl">{value}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

const QuoteCard = ({ item }) => (
  <Card className="h-full border-border/60 bg-background/80 shadow-sm">
    <CardContent className="space-y-5 p-6">
      <div className="flex items-center gap-4">
        <Image
          width={48}
          height={48}
          src={item.image}
          alt={item.author}
          className="h-12 w-12 rounded-full border-2 border-primary/20 object-cover"
        />
        <div>
          <p className="font-semibold">{item.author}</p>
          <p className="text-sm text-muted-foreground">{item.role}</p>
          <p className="text-sm text-primary">{item.company}</p>
        </div>
      </div>

      <blockquote className="relative pl-5 text-sm leading-7 text-muted-foreground">
        <span className="absolute left-0 top-0 text-3xl leading-none text-primary">
          “
        </span>
        {item.quote}
      </blockquote>
    </CardContent>
  </Card>
);

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid-background" />

      <section className="relative">
        <HeroSection />
      </section>

      <section className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <SectionTitle
                align="left"
                eyebrow="Why Sensi AI"
                title="Everything you need to move from preparation to action"
                description="A focused workspace for building career momentum with AI-powered tools, structured guidance, and practical outcomes."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Built for real workflow</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Designed to keep users moving through the career process without
                  friction.
                </p>
              </div>

              <div className="grid gap-4">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                  <StatCard key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="cursor-pointer rounded-full px-6">
                  <Link href="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer rounded-full px-6"
                >
                  <Link href="/ai-cover-letter/new">Create Cover Letter</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            eyebrow="How It Works"
            title="Four simple steps to accelerate your career growth"
            description="A clear process that helps users understand what to do next and why it matters."
          />

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-4">
            {howitWorks.map((item, index) => (
              <Card
                key={item.title}
                className="border-border/60 bg-background/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="flex h-full flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            eyebrow="User Feedback"
            title="What people say after using Sensi AI"
            description="Social proof presented clearly, with emphasis on outcomes and trust."
          />

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonial.map((item) => (
              <QuoteCard key={item.author} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-muted/40 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionTitle
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Answer common questions up front to reduce hesitation and support conversions."
          />

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question ?? index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-sm md:p-12">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Ready to Start
              </div>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Ready to accelerate your career?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-lg">
                Join thousands of professionals using Sensi AI to build stronger
                applications, practice interviews, and make smarter career moves.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="cursor-pointer rounded-full px-6">
                  <Link href="/dashboard">
                    Start Your Journey Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="cursor-pointer rounded-full px-6"
                >
                  <Link href="/resume">Build Your Resume</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
