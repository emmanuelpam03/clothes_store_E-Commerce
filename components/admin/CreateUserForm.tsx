"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createUserAdmin } from "@/app/actions/admin.actions";
import { Copy, Check } from "lucide-react";

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [wasEmailSent, setWasEmailSent] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setWasEmailSent(false);
    setTempPassword("");
    setLoading(true);

    try {
      const result = await createUserAdmin({
        email,
        name,
        role,
        sendEmail,
      });

      if (result.success) {
        setSuccess(true);
        // Capture whether email was sent before resetting form
        setWasEmailSent(sendEmail);
        // Set temporary password if provided
        if (result.temporaryPassword) {
          setTempPassword(result.temporaryPassword);
        }
        // Reset form
        setEmail("");
        setName("");
        setRole("USER");
        setSendEmail(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!tempPassword) return;

    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="user@example.com"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Full Name *</FieldLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="John Doe"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Role *</FieldLabel>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>

            <div className="flex items-center gap-2">
              <input
                id="sendEmail"
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={loading}
                className="w-4 h-4"
              />
              <label htmlFor="sendEmail">Send credentials via email</label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating User..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {success && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              User Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-4">
              {wasEmailSent
                ? "An email has been sent to the user with their login credentials."
                : "Please share the following temporary password with the user:"}
            </p>
            {tempPassword && (
              <div className="bg-white border border-green-300 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono font-semibold">
                    {tempPassword}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="ml-4"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-green-700 mt-4">
              The user will be required to change this password when they first
              log in. The temporary password expires in 7 days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
