import React from 'react';
import { SignIn2 } from "@/components/ui/clean-minimal-sign-in";

const Demo = () => {
  return (
    <SignIn2 />
  );
};

export const Login: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 selection:bg-blue-500/20 selection:text-blue-900 overflow-hidden">
      {/* Global Fixed Smart City Background */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-no-repeat bg-top"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center top',
        }}
        aria-hidden="true"
      >
        {/* Soft atmospheric gradient wash matching app aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5DC]/35 via-[#F5F5DC]/55 to-[#F5F5DC]/80 backdrop-blur-[0.5px]" />
      </div>

      <div className="w-full flex items-center justify-center my-auto">
        <Demo />
      </div>
    </div>
  );
};

export { Demo };
export default Login;
