import prisma from "@/app/libs/prismadb";
export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}
export default async function getListings(params: IListingsParams) {
  try {
    const {
      userId,
      guestCount,
      roomCount,
      bathroomCount,
      startDate,
      endDate,
      locationValue,
      category,

     } = params;
    let query: any = {};
    
    userId && (query.userId = userId);
    category && (query.category = category);
    roomCount && (query.roomCount = {gte: +roomCount});
    guestCount && (query.guestCount = {gte: +guestCount});
    bathroomCount && (query.bathroomCount = {gte: +bathroomCount});
    locationValue && (query.locationValue = locationValue);
    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate},
                startDate: { lte: startDate},
              },
              { 
                startDate: { lte: endDate},
                endDate: { gte: startDate},
              }
            ]
          }
        }
      }
    }
  
    const listings = await prisma.listing.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
    });
    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));
    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}
