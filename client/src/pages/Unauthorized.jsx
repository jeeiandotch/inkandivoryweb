import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="mb-2 font-script text-4xl text-taupe-dark">Locked pages</p>
      <p className="mb-6 text-sm text-ink/60">
        This part of the sanctuary is only open to the writer and their staff.
      </p>
      <Link to="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
