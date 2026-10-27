import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

// Wer hier landet, ist angemeldet und hat noch keine Familie. Das stellt
// src/proxy.ts sicher (lib/routeGuard.ts).
export default function OnboardingPage() {
  return <OnboardingFlow />;
}
