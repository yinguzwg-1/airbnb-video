import { ClientOnly, EmptyState } from "../components";
import getFavoriteListings from "../actions/getFavoriteListings";
import getCurrentUser from "../actions/getCurrentUser";
import FavoritesClient from "./FavoritesClient";

const ListingPage = async () => {
  const listings = await getFavoriteListings();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <ClientOnly>
      <EmptyState 
        title="Unauthorized"
        subtitle="Please login"
      />
    </ClientOnly>
  }

  if (listings.length === 0) {
    return (<ClientOnly>
    <EmptyState 
      subtitle="Looks like you have no favorite listings" 
      title="No favorites found"
    />
  </ClientOnly>);
  }
  return <ClientOnly>
    <FavoritesClient
      listings={listings}
      currentUser={currentUser}
    />
  </ClientOnly>
}
 
export default ListingPage;