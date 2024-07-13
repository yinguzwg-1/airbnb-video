import { ClientOnly, Container, EmptyState, ListingCard } from "./components";
import getListings, { IListingsParams } from "./actions/getListings";
import getCurrentUser from "./actions/getCurrentUser";
import { SafeListing, SafeUser } from "./common/type";


const Home = async () => {
  const currentUser = await getCurrentUser();
  const listings = await getListings({});
  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }
  return (
    <ClientOnly>
      <Container>
        <div
          className="
          pt-24
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
        >
          {listings.map((listing: SafeListing) => {
            return (
              <ListingCard
                key={listing.id}
                currentUser={currentUser as SafeUser | null}
                data={listing}
              />
            );
          })}
        </div>
      </Container>
    </ClientOnly>
  );
}

export default Home;
