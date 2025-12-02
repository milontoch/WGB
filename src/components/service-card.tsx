import Link from "next/link";
import Image from "next/image";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  image_url?: string;
}

export function ServiceCard({
  id,
  name,
  description,
  price,
  duration,
  category,
  image_url,
}: ServiceCardProps) {
  return (
    <div className="group bg-white rounded-[18px] overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-[0_5px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4B58E]/10 to-[#D4B58E]/5">
            <span className="text-6xl opacity-20">💎</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 text-center">
        <h3 className="font-['Poppins'] text-xl font-semibold text-[#111111] mb-3">
          {name}
        </h3>
        
        <p className="text-[#111111]/70 text-[15px] font-light leading-relaxed mb-4 min-h-[48px]">
          {description}
        </p>

        <div className="text-3xl font-semibold text-[#D4B58E] mb-6">
          ₦{price.toLocaleString('en-NG')}
        </div>

        <Link
          href={`/book/${id}`}
          className="inline-block w-full px-8 py-4 bg-[#D4B58E] text-white text-sm font-medium tracking-wide rounded-full transition-all duration-300 hover:bg-[#C4A57E] hover:shadow-lg"
        >
          BOOK NOW
        </Link>
      </div>
    </div>
  );
}
