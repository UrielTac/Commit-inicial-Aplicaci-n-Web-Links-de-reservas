import { mockPublicClasses } from "@/components/public-class-registration/config/mock-data"
import { PublicClassRegistrationForm } from "@/components/public-class-registration"

export default function InscripcionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <PublicClassRegistrationForm classes={mockPublicClasses} />
    </main>
  )
} 