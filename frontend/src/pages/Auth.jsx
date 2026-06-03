import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Candy, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(1, "Full name is required").optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [signupTab, setSignupTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    try {
      if (isLogin) {
        authSchema
          .pick({ email: true, password: true })
          .parse({ email, password });
      } else {
        authSchema.parse({ email, password, fullName });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
      }
      isValid = false;
    }

    // Custom domain and key validations
    if (!isLogin) {
      if (signupTab === "admin") {
        if (!email.trim()) {
          // handled by zod
        } else if (!email.toLowerCase().endsWith("@sweetshop.com")) {
          newErrors.email = "Admin email must use @sweetshop.com domain";
          isValid = false;
        }
        if (adminKey !== "024") {
          newErrors.adminKey = "Invalid admin registration key";
          isValid = false;
        }
      } else if (signupTab === "user") {
        if (email.toLowerCase().endsWith("@sweetshop.com")) {
          newErrors.email =
            "Emails with @sweetshop.com must sign up under the Admin tab";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (
            error.message.includes("Invalid login credentials") ||
            error.message.includes("Invalid email or password")
          ) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        const role = signupTab === "admin" ? "admin" : "user";
        const key = signupTab === "admin" ? adminKey : undefined;
        const { error } = await signUp(email, password, fullName, role, key);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error(
              "This email is already registered. Please sign in instead.",
            );
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(
            role === "admin"
              ? "Admin account created successfully!"
              : "Account created successfully!",
          );
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md page-transition">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-hero">
              <Candy className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-serif font-semibold text-foreground">
              Sweet<span className="text-primary">Shop</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to access your sweet shop account"
                : "Join us and explore our delicious treats"}
            </p>
          </div>

          {/* Tab Selector for Signup */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-6">
              <button
                type="button"
                onClick={() => {
                  setSignupTab("user");
                  setErrors({});
                }}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  signupTab === "user"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                User Signup
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupTab("admin");
                  setErrors({});
                }}
                className={`py-2 text-sm font-medium rounded-md transition-all ${
                  signupTab === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin Signup
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={errors.fullName ? "border-destructive" : ""}
                />

                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  signupTab === "admin" && !isLogin
                    ? "name@sweetshop.com"
                    : "you@example.com"
                }
                className={errors.email ? "border-destructive" : ""}
              />

              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={
                    errors.password ? "border-destructive pr-10" : "pr-10"
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {!isLogin && signupTab === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Access Key</Label>
                <Input
                  id="adminKey"
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter security key"
                  className={errors.adminKey ? "border-destructive" : ""}
                />

                {errors.adminKey && (
                  <p className="text-sm text-destructive">{errors.adminKey}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin
                ? "Sign In"
                : signupTab === "admin"
                  ? "Register Admin"
                  : "Create Account"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8 animate-float">
            <Candy className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-4">
            Discover Sweet Delights
          </h2>
          <p className="text-lg opacity-90">
            From handcrafted chocolates to artisan candies, explore our
            collection of premium confections.
          </p>
        </div>
      </div>
    </div>
  );
}
