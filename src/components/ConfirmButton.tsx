import { Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { PillButton } from './primitives';

/** Two-step destructive button: first press arms it, second press confirms. */
export function DeleteButton({ onConfirm, label = 'Delete' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <PillButton
      icon={Trash2}
      label={armed ? 'Confirm?' : label}
      active={armed}
      onPress={() => (armed ? onConfirm() : setArmed(true))}
    />
  );
}
