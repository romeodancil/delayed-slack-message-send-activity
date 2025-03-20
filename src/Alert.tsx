import { Alert, AlertDescription } from "./components/ui/alert";

interface AlertProps {
  message: string;
  variant: VariantType;
}

type VariantType = "default" | "destructive";

export const AlertComponent = ({ message, variant }: AlertProps) => {
  return (
    <Alert variant={variant}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
