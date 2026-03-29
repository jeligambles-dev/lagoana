import { Shield, Phone, Mail, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VerificationBadgesProps {
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  isPermitVerified?: boolean;
  compact?: boolean;
}

export function VerificationBadges({ isPhoneVerified, isIdVerified, compact }: VerificationBadgesProps) {
  const hasAny = isPhoneVerified || isIdVerified;

  if (!hasAny) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {isPhoneVerified && (
          <Badge className="bg-[#1B3A2B] text-gold text-[10px] gap-0.5">
            <Phone className="h-2.5 w-2.5" /> Telefon
          </Badge>
        )}
        {isIdVerified && (
          <Badge className="bg-[#1B3A2B] text-gold text-[10px] gap-0.5">
            <Mail className="h-2.5 w-2.5" /> Email
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-gold" />
      <span className="text-xs text-[#888]">Verificat:</span>
      {isPhoneVerified && (
        <span className="flex items-center gap-1 text-xs text-gold">
          <CheckCircle className="h-3 w-3" /> Telefon
        </span>
      )}
      {isIdVerified && (
        <span className="flex items-center gap-1 text-xs text-gold">
          <CheckCircle className="h-3 w-3" /> Email
        </span>
      )}
    </div>
  );
}
