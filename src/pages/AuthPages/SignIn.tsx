import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión"
        description="Inicia sesión para acceder al sistema de seguimiento de reportes."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
