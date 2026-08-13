export default function ComingSoon({ title }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="mb-2 font-script text-3xl text-taupe-dark">{title}</p>
      <p className="text-sm text-ink/60">
        This section is being written into existence in the next build phase.
      </p>
    </div>
  );
}
