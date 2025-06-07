import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Card from "./Card";
import { useLocale } from "@/components/LocaleProvider";

interface ValueIDCardProps {
  id: string;
  name: string;
  image: string;
  indexNumber: string;
  price: number;
  rarity?: string;
  isRental?: boolean;
  rentalPrice?: number;
  paymentCurrency?: string;
  displayMode?: "inventory" | "sale" | "rental"; // 显示模式：库存/出售/租赁
}

const ValueIDCard: React.FC<ValueIDCardProps> = ({
  id,
  name,
  image,
  indexNumber,
  price,
  rarity,
  isRental = false,
  rentalPrice,
  paymentCurrency,
  displayMode = "sale", // 默认为出售模式
}) => {
  const router = useRouter();
  const { t } = useLocale();

  const handleClick = () => {
    router.push(`/nft/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="overflow-hidden mb-[16px] hover:shadow-md transition-shadow duration-200"
      style={{
        backgroundColor: "var(--card-background)",
        boxShadow: "0 2px 4px var(--card-shadow)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "var(--border-color)",
        borderRadius: "0.75rem",
      }}
    >
      <div className="relative w-[100%] aspect-square rounded-[0.5rem] overflow-hidden mb-[8px]">
        <Image src={image} alt={name} fill className="object-cover" />
        {rarity && (
          <div className="absolute top-[8px] right-[8px] bg-[rgba(0,0,0,0.7)] text-[#ffffff] text-[0.75rem] px-[8px] py-[4px] rounded-[9999px]">
            {rarity}
          </div>
        )}
      </div>
      <h3
        className="font-[500] text-[0.875rem] truncate"
        style={{ color: "var(--foreground)" }}
      >
        {name}
      </h3>
      <div
        className="text-[0.75rem] mb-[4px]"
        style={{ color: "var(--tab-inactive-color)" }}
      >
        {indexNumber}
      </div>
      <div className="flex justify-between items-center">
        {displayMode === "inventory" ? (
          // 库存模式下不显示价格，只显示ID信息
          <div
            className="text-[0.75rem]"
            style={{ color: "var(--tab-inactive-color)" }}
          >
            {t("id.owned")}
          </div>
        ) : (
          // 出售或租赁模式
          <>
            <div style={{ color: "var(--primary-color)", fontWeight: 700 }}>
              {displayMode === "rental" && isRental && rentalPrice
                ? `¥${Number(rentalPrice).toFixed(2)}`
                : `¥${Number(price).toFixed(2)}`}
            </div>
            {displayMode === "rental" && isRental ? (
              <div
                className="text-[0.75rem]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {t("id.rentalPrice")}
              </div>
            ) : displayMode === "sale" ? (
              <div
                className="text-[0.75rem]"
                style={{ color: "var(--tab-inactive-color)" }}
              >
                {paymentCurrency || "ETH"}
              </div>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
};

// 为了保持兼容性
const NFTCard = ValueIDCard;

export default ValueIDCard;
export { NFTCard };
