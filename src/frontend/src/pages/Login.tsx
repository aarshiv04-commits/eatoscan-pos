import { Button } from "@/components/ui/button";
import { Loader2, LogIn, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Login() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-2xl shadow-card-hover p-8 text-center">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl bg-sidebar-bg mx-auto mb-4 flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0F1113, #1B1E21)" }}
          >
            <img
              src="/assets/generated/eatoscan-logo-transparent.dim_80x80.png"
              alt="Eat'O'Scan"
              className="w-12 h-12 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            Eat<span className="text-gold">'O'</span>Scan
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Restaurant POS System
          </p>

          <div className="space-y-3 mb-6 text-left">
            {[
              "Manage tables & orders",
              "Kitchen display system",
              "Menu management",
              "Billing & reports",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <UtensilsCrossed size={14} className="text-gold shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-11 text-base font-semibold"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn size={16} className="mr-2" />
                Sign In to Continue
              </>
            )}
          </Button>

          {isLoginError && (
            <p
              className="text-destructive text-sm mt-3"
              data-ocid="login.error_state"
            >
              {loginError?.message || "Login failed. Please try again."}
            </p>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            New restaurant?{" "}
            <a
              href="/register"
              className="text-gold hover:underline font-medium"
              data-ocid="login.link"
            >
              Register here
            </a>
          </p>

          <p className="text-muted-foreground text-xs mt-4">
            Secured by Internet Identity on ICP
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Eat&apos;O&apos;Scan Inc. &bull;{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="hover:text-foreground transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
