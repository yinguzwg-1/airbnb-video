import { Language } from "@/app/i18n";
import BurryPointClient from "@/app/components/BurryPoint/BurryPointClient";
import { getBurryPointData } from "@/app/actions/getBurryPointData";

interface BurryPointPageProps {
  params: { lang: Language };
  searchParams: {
    page: string;
  
  };
}


export default async function BurryPointPage({ params, searchParams }: BurryPointPageProps) {
 
  // 获取初始数据（不指定用户ID，获取所有数据）
  const initialData = await getBurryPointData({page: searchParams.page});
  
  return <BurryPointClient 
    lang={params.lang} 
    data={initialData?.data} 
  />;
} 