import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Card from "./Card";

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  rarity?: string;
  isRental?: boolean;
  rentalPrice?: number;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  image,
  price,
  rarity,
  isRental = false,
  rentalPrice,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/nft/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden bg-[#252525] border-none mb-[16px]"
    >
      <div className="relative w-[100%] aspect-square rounded-[0.5rem] overflow-hidden mb-[8px]">
        <Image src={image} alt={name} fill className="object-cover" />
        {rarity && (
          <div className="absolute top-[8px] right-[8px] bg-[rgba(0,0,0,0.7)] text-[#ffffff] text-[0.75rem] px-[8px] py-[4px] rounded-[9999px]">
            {rarity}
          </div>
        )}
      </div>
      <h3 className="font-[500] text-[0.875rem] truncate text-[#ffffff]">
        {name}
      </h3>
      <div className="flex justify-between items-center mt-[4px]">
        <div className="text-[#8b5cf6] font-[700]">¥{price.toFixed(2)}</div>
        {isRental && rentalPrice && (
          <div className="text-[0.75rem] text-[#9ca3af]">
            租赁: ¥{rentalPrice.toFixed(2)}/天
          </div>
        )}
      </div>
    </Card>
  );
};

export default NFTCard;
