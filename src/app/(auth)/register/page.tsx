import RegisterForm from "@/components/auth/RegisterForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Get started"
      subtitle="Create your account to start your fitness journey"
      linkText="Already have an account?"
      linkHref="/login"
      linkAnchorText="Sign in"
    >
      <RegisterForm />
    </AuthLayout>
  );
}