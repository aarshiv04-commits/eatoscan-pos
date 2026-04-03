import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type FormState = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
};

const INITIAL_FORM: FormState = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  city: "",
  country: "",
};

export default function Register() {
  const { identity, login, isLoggingIn, isLoginError } = useInternetIdentity();
  const { actor } = useActor();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;

    const missing = Object.entries(form).find(([, v]) => !v.trim());
    if (missing) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await (actor as any).registerTenant({
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0F1113, #1B1E21)" }}
          >
            <img
              src="/assets/generated/eatoscan-logo-transparent.dim_80x80.png"
              alt="Eat'O'Scan"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Eat<span className="text-gold">'O'</span>Scan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register your restaurant
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-border" data-ocid="register.success_state">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-14 h-14 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-success" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Application Submitted!
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mb-6">
                  Registration submitted! Our team will review your application
                  and get back to you shortly.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gold hover:underline font-medium"
                  data-ocid="register.link"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ) : !identity ? (
          /* Step 1 — Sign in first */
          <Card className="border-border">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <LogIn size={18} className="text-gold" />
                </div>
                <h2 className="font-semibold text-foreground mb-1">
                  Sign in to continue
                </h2>
                <p className="text-muted-foreground text-sm">
                  You need an Internet Identity to register your restaurant.
                </p>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full h-11 text-base font-semibold"
                data-ocid="register.primary_button"
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
                  className="text-destructive text-sm mt-3 text-center"
                  data-ocid="register.error_state"
                >
                  Login failed. Please try again.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Step 2 — Registration form */
          <Card className="border-border">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <Building2 size={15} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Business Details
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All fields are required
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-ocid="register.dialog"
              >
                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="businessName"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Building2 size={13} className="text-muted-foreground" />
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. The Golden Spoon Restaurant"
                    value={form.businessName}
                    onChange={handleChange("businessName")}
                    required
                    data-ocid="register.input"
                  />
                </div>

                {/* Owner Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ownerName"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <User size={13} className="text-muted-foreground" />
                    Owner Name
                  </Label>
                  <Input
                    id="ownerName"
                    placeholder="Your full name"
                    value={form.ownerName}
                    onChange={handleChange("ownerName")}
                    required
                    data-ocid="register.input"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Mail size={13} className="text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@restaurant.com"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                    data-ocid="register.input"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Phone size={13} className="text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    required
                    data-ocid="register.input"
                  />
                </div>

                {/* City & Country — 2-col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="city"
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <MapPin size={13} className="text-muted-foreground" />
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={form.city}
                      onChange={handleChange("city")}
                      required
                      data-ocid="register.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="country"
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <MapPin size={13} className="text-muted-foreground" />
                      Country
                    </Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={form.country}
                      onChange={handleChange("country")}
                      required
                      data-ocid="register.input"
                    />
                  </div>
                </div>

                {error && (
                  <p
                    className="text-destructive text-sm bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2"
                    data-ocid="register.error_state"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-base font-semibold mt-2"
                  data-ocid="register.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <a
            href="/"
            className="text-gold hover:underline font-medium"
            data-ocid="register.link"
          >
            Sign in
          </a>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-3">
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
