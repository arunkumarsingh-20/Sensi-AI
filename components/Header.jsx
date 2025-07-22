import React from 'react'
import { SignedIn, SignInButton, UserButton, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from './ui/dropdown-menu'
import { checkUser } from '@/lib/checkUser'
const Header = async () => {
    await checkUser();
    return (
        <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md
        z-50 supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 py-2'>
            <nav className='mx-auto max-w-7xl h-16 flex items-center justify-between'>
                <Link href="/">
                    <Image
                        src="/logo-ai.png"
                        alt="SensiAI-logo"
                        width={300}
                        height={120}
                        className="h-16 w-auto object-contain"
                    />
                </Link>
                <div className='flex items-center space-x-2 md:space-x-4'>
                    <SignedIn>
                        <Link href={"/dashboard"}>
                            <Button className="cursor-pointer" variant="outline">
                                <LayoutDashboard className='h-4 w-4' />
                                <span className='hidden md:block'>Industry Insights</span>
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="cursor-pointer">
                                    <StarsIcon className="h-4 w-4" />
                                    <span className="hidden md:block">Growth Tools</span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="/resume" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Build Resume</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/ai-cover-letter" className="flex items-center gap-2">
                                        <PenBox className="h-4 w-4" />
                                        <span>Cover Letter</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/interview" className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>Interview Prep</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </SignedIn>
                    <SignedOut>
                        <SignInButton>
                            <Button className="cursor-pointer" variant="outline">Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                    userButtonPopoverCard: "shadow-xl",
                                    userPreviewMainIdentifier: "font-bold",
                                },
                            }}
                            afterSignOutUrl='/'
                        />
                    </SignedIn>
                </div>
            </nav>
        </header>
    )
}

export default Header