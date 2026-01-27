import { SignupForm } from "@/components/auth/signup-form";


export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
