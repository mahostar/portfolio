import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() { return <div className="container not-found"><p className="eyebrow">404 / Connection not found</p><h1>This page took<br />a different route.</h1><p>The page you’re looking for isn’t here.</p><Link href="/" className="text-link"><ArrowLeft size={18} />Back home</Link></div>; }
