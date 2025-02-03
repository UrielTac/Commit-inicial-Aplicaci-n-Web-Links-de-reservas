import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PublishFormDialogProps {
  isOpen: boolean;
  isPublishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PublishFormDialog({
  isOpen,
  isPublishing,
  onConfirm,
  onCancel
}: PublishFormDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Publicar formulario?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción hará que tu formulario esté disponible públicamente. 
            Podrás compartir el enlace con cualquier persona.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPublishing}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isPublishing}
            className="gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 