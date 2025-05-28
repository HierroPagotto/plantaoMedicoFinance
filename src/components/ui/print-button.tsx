import { Button } from "@/components/ui/button";
import { Printer, FileDown, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PrintButton = () => {
    const handlePrint = () => {
        document.body.classList.add('print-landscape');
        
        document.body.classList.add('printing-active');
        
        window.print();
        
        setTimeout(() => {
            document.body.classList.remove('print-landscape');
            document.body.classList.remove('printing-active');
        }, 1000);
    };

    const handleSaveAsPDF = () => {
        document.body.classList.add('print-landscape');
        
        document.body.classList.add('printing-active');

        window.print();
        
        setTimeout(() => {
            document.body.classList.remove('print-landscape');
            document.body.classList.remove('printing-active');
        }, 1000);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Printer size={16} />
                    Imprimir Perfil
                    <ChevronDown size={14} className="ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem 
                    onClick={handlePrint}
                    className="cursor-pointer flex items-center"
                >
                    <Printer size={16} className="mr-2" />
                    Imprimir
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={handleSaveAsPDF}
                    className="cursor-pointer flex items-center"
                >
                    <FileDown size={16} className="mr-2" />
                    Salvar como PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default PrintButton;