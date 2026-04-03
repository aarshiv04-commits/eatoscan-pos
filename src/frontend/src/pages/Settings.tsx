import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Settings as SettingsIcon, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile, useSaveUserProfile } from "../hooks/useQueries";

export default function Settings() {
  const { data: profile, isLoading } = useGetUserProfile();
  const saveProfile = useSaveUserProfile();
  const { identity } = useInternetIdentity();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        role: role.trim() || "Staff",
      });
      toast.success("Profile saved successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    }
  };

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="px-8 py-6 animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SettingsIcon size={24} className="text-gold" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile and application settings
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Card */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User size={16} />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                data-ocid="settings.profile.name.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input
                id="profile-role"
                placeholder="e.g. Manager, Waiter, Chef"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                data-ocid="settings.profile.role.input"
              />
            </div>

            {principal && (
              <div className="space-y-2">
                <Label>Principal ID</Label>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-[11px] font-mono text-muted-foreground break-all">
                    {principal}
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saveProfile.isPending || isLoading}
              data-ocid="settings.profile.save_button"
            >
              {saveProfile.isPending ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : (
                <Save size={14} className="mr-2" />
              )}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* App Info */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base">
              About Eat&apos;O&apos;Scan POS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <Badge className="bg-secondary text-muted-foreground border-0">
                1.0.0
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span>Internet Computer (ICP)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Built with</span>
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
