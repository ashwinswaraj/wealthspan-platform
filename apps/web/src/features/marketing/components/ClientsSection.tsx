import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "@/lib/react-router-dom";
import ClientIdCard from "@jobrio/ui/shared/ClientIdCard";
import { allClients } from "@jobrio/constants/clients";
import { useHorizontalInfinite } from "@jobrio/hooks/use-horizontal-infinite";

interface Props {
  activeCardId: string | null;
  activeType: "flip" | "qr" | null;
  onFlip: (id: string) => void;
  onQrExpand: (id: string) => void;
}

const ClientsSection = ({ activeCardId, activeType, onFlip, onQrExpand }: Props) => {
  const navigate = useNavigate();
  const { ref, count, loading, hasMore } = useHorizontalInfinite(allClients.length, 6, 3);
  const visible = allClients.slice(0, count);

  return (
    <section id="clients" className="px-8 md:px-20 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface mb-2">Our Top Clients</h2>
          <p className="text-on-surface-variant text-lg">
            Visionary partners scaling through the Jobrio engine.
          </p>
        </div>
        <button
          onClick={() => navigate("/clients")}
          className="px-2 py-3 font-headline font-bold text-primary hover:text-primary-container hover:scale-[1.04] active:scale-[0.95] hover:-translate-y-0.5 transition-all duration-300 flex items-center"
        >
          Explore More <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory"
      >
        {visible.map((client) => (
          <ClientIdCard
            key={client.id}
            data={client}
            isFlipped={activeCardId === client.id && activeType === "flip"}
            isQrExpanded={activeCardId === client.id && activeType === "qr"}
            onFlip={() => onFlip(client.id)}
            onQrExpand={() => onQrExpand(client.id)}
          />
        ))}
        {hasMore && (
          <div className="min-w-[160px] flex items-center justify-center text-on-surface-variant">
            <Loader2 className={`w-6 h-6 ${loading ? "animate-spin" : "opacity-40"}`} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientsSection;
