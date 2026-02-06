import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { LayoutDashboard, Users, Map, Settings, ShieldCheck, Activity, UploadCloud, Bot, Ear, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HAKIKI AI | Command Center",
    description: "Sovereign Integrity Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex h-screen overflow-hidden bg-slate-950 text-white`}>
                {/* Sidebar */}
                <aside className="w-16 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-sm flex items-center justify-center">
                            <ShieldCheck className="text-slate-900 w-5 h-5" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="font-bold text-lg leading-none tracking-tighter">HAKIKI<span className="text-yellow-500">AI</span></h1>
                            <p className="text-[10px] text-slate-500 tracking-widest">COMMAND V2.0</p>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-6 mt-2">
                        {/* OPERATIONS GROUP */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-2">Operations</p>
                            <div className="space-y-1">
                                <Link href="/audit/dashboard">
                                    <NavItem icon={<LayoutDashboard size={18} />} label="War Room" />
                                </Link>
                                <Link href="/audit/upload">
                                    <NavItem icon={<UploadCloud size={18} />} label="New Audit" />
                                </Link>
                            </div>
                        </div>

                        {/* INTELLIGENCE GROUP */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-2">Intelligence</p>
                            <div className="space-y-1">
                                <Link href="/investigation">
                                    <NavItem icon={<Bot size={18} />} label="Sovereign Assistant" />
                                </Link>
                                <Link href="/intelligence">
                                    <NavItem icon={<Ear size={18} />} label="Whistleblower Portal" />
                                </Link>
                            </div>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <Link href="/auth/login">
                            <div className="flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer text-slate-400 hover:bg-red-950/20 hover:text-red-500 transition-all group">
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                <span className="hidden md:block text-sm font-medium">Logout</span>
                            </div>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    {children}
                </main>
            </body>
        </html>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`
            flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-all
            ${active ? 'bg-slate-800 text-yellow-500 border-l-2 border-yellow-500' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
        `}>
            {icon}
            <span className="hidden md:block text-sm font-medium">{label}</span>
        </div>
    )
}
