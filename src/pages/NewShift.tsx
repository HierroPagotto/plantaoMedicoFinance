
import { AppShell } from '@/components/layout/AppShell';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewShift = () => {
  return (
    <AppShell>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link to="/shifts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Registrar novo plantão</h1>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <ShiftForm />
      </div>
    </AppShell>
  );
};

export default NewShift;
