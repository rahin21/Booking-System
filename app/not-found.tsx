import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import BackButton from "@/components/BackButton";
import AnimateIn from "@/components/AnimateIn";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white">
      <section className="container mx-auto px-4 py-24">
        <AnimateIn>
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-200 to-purple-200 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200 blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium">
                <Search className="h-3.5 w-3.5" />
                Page Not Found
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Oops! We couldn’t find that page.
              </h1>
              <p className="text-gray-600 leading-relaxed">
                The page you’re looking for may have moved, been deleted, or
                never existed. Try going back, search again, or head to the
                home page.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Link>
                </Button>
                <BackButton />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Check the URL</p>
                  <p className="text-xs text-gray-500">Make sure the address is typed correctly.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Use navigation</p>
                  <p className="text-xs text-gray-500">Try links in the header to browse.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Visit Home</p>
                  <p className="text-xs text-gray-500">Start from the homepage and explore.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-blue-100 blur-xl" />
                <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-purple-100 blur-xl" />
                <div className="overflow-hidden rounded-xl border bg-white">
                  <Image
                    src="/globe.svg"
                    alt="Not Found"
                    width={320}
                    height={320}
                    className="p-8 opacity-90"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </AnimateIn>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Error 404 — Page Not Found</p>
        </div>
      </section>
    </div>
  );
}