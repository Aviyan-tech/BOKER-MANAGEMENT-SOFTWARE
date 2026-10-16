"use client";

import { useEffect, useRef } from "react";
import { UserRole, useAuth } from "../context/AuthContext";

interface GoogleSignInButtonProps {
  role?: UserRole;
  onError?: (msg: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({ role, onError }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<UserRole | undefined>(role);
  const scriptLoadedRef = useRef(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    if (scriptLoadedRef.current) {
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "signin_with",
            shape: "pill",
          });
        }
      }
    };

    document.body.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [googleClientId]);

  const handleCredentialResponse = async (response: any) => {
    try {
      await loginWithGoogle(response.credential, roleRef.current);
    } catch (err: any) {
      const errorMsg = err.message || "Google sign-in failed";
      if (onError) {
        onError(errorMsg);
      } else {
        console.error("Google sign-in error:", errorMsg);
      }
    }
  };

  if (!googleClientId) {
    return (
      <div className="text-xs text-muted-foreground text-center">
        Google Sign-In is not configured
      </div>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
