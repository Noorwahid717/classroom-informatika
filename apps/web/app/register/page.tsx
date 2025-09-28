import { RegistrationForm } from "../../components/registration-form";

export const metadata = {
  title: "Daftar Program GEMA"
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <RegistrationForm />
    </div>
  );
}
