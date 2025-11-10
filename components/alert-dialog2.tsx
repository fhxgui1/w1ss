import * as React from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogContentProps,
} from '@/components/animate-ui/components/radix/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RadixAlertDialogProps {
  from: AlertDialogContentProps['from'];
  triggerLabel?: string;
  title?: string;
  description: string;
  description2?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onAction?: (text: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialComment?: string; // nome atualizado p/ bater com seu uso
  children?: React.ReactNode; // <== 🔹 adicionado para aceitar conteúdo interno
}

export const RadixAlertDialog = ({
  from,
  title,
  description,
  description2,
  cancelLabel = 'Cancelar',
  actionLabel = 'Continuar',
  onAction,
  open,
  onOpenChange,
  initialComment = '',
  children,
}: RadixAlertDialogProps) => {
  const [text, setText] = React.useState(initialComment);

  React.useEffect(() => {
    if (!open) {
      setText(initialComment);
    }
  }, [open, initialComment]);

  const handleAction = () => {
    onAction?.(text);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent from={from} className="sm:max-w-[425px]">
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
          {description2 && (
            <AlertDialogDescription>{description2}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* 🔹 children renderizados aqui */}
        {children && <div className="mb-3">{children}</div>}

        <div className="py-4">
          <Textarea
            placeholder="Digite sua mensagem aqui..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction}>
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
