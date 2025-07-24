import { Language } from "@/app/i18n";
import BurryPointClient from "@/app/components/BurryPoint/BurryPointClient";
import { getBurryPointData } from "@/app/actions/getBurryPointData";

interface BurryPointPageProps {
  params: { lang: Language };
  searchParams: {
    page?: string;
    limit?: string;
  };
}


export default async function BurryPointPage({ params, searchParams }: BurryPointPageProps) {
 
  // 获取初始数据（减少初始加载量以提高速度）
  const initialData = await getBurryPointData({
    page: searchParams.page || '1',
    limit: searchParams.limit || '10' // 减少到10条，提高初始加载速度
  });
  return <BurryPointClient 
    lang={params.lang} 
    data={initialData?.data}
    currentPage={parseInt(searchParams.page || '1')}
    pageSize={parseInt(searchParams.limit || '20')}
  />;
} 