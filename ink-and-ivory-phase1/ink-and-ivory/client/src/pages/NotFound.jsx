import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="mb-2 font-script text-4xl text-taupe-dark">A page unwritten</p>
      <p className="mb-6 text-ink/60">This page doesn't exist — yet, or anymore.</p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
