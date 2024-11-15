import { ClassRegistrationForm } from "@/components/class-registration"

interface ClassRegistrationPageProps {
  params: {
    classId: string
  }
}

export default function ClassRegistrationPage({ params }: ClassRegistrationPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <ClassRegistrationForm classId={params.classId} />
      </div>
    </main>
  )
} 