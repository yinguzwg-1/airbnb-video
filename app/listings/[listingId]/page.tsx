import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import { ClientOnly, EmptyState } from "@/app/components";
import ListingClient from "./ListingClient";
import getReservations from "@/app/actions/getReservations";
interface IParams {
  listingId?: string;
}
const ListingPage = async ({ params }: { params: IParams }) => {
  const listing = await getListingById(params);
  const reservations= await getReservations(params)
  const currentUser = await getCurrentUser();
  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }
  return (
    <ClientOnly>
      <ListingClient reservations={reservations} listing={listing} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default ListingPage;
