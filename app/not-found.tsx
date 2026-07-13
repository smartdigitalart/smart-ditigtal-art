import Link from "next/link";

export default function NotFound() {
   return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
         <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
               The page you are looking for does not exist or has been moved.
            </p>
            <div className="mt-6 flex items-center justify-center">
               <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
               >
                  Go to home
               </Link>
            </div>
         </div>
      </div>
   );
}
