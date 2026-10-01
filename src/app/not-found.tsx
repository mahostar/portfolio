import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container not-found">
      <span className="not-found-code" aria-hidden="true">
        404
      </span>
      <p className="eyebrow">404 / Connection not found</p>
      <h1>
        This page took
        <br />a different route<span className="heading-dot">.</span>
      </h1>
      <p>The page you’re looking for isn’t here.</p>
      <div className="not-found-actions">
        <Link href="/" className="text-link">
          <ArrowLeft size={18} />
          Back home
        </Link>
        <Link href="/projects" className="text-link">
          Explore projects
        </Link>
      </div>
    </div>
  );
}
