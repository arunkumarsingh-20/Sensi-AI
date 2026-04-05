"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="w-full pb-10 pt-36 md:pt-48">
      <div className="space-y-6 text-center">
        <div className="mx-auto space-y-6">
          <h1 className="gradient-title text-5xl font-bold md:text-6xl lg:text-7xl xl:text-7xl">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="cursor-pointer px-8">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="cursor-pointer px-8">
            <Link href="/dashboard">AI Coach</Link>
          </Button>
        </div>

        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div className="hero-image">
            <Image
              src="/ai-banner.webp"
              width={1280}
              height={720}
              alt="Dashboard preview"
              className="mx-auto rounded-lg border shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
