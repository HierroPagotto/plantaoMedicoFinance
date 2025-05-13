import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const PrintButton = () => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrint}
        >
            <Printer size={16} />
            Imprimir Perfil
        </Button>
    );
};

export default PrintButton;