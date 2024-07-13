import { EmptyState, ClientOnly } from "../components";
import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservations";
import TripClient from "./TripClient";


const TripsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <ClientOnly>
      <EmptyState 
        title="Unauthorized"
        subtitle="Please login"
      />
    </ClientOnly>
  }
  const reservations = await getReservations({
    userId: currentUser.id
  })
  if (reservations.length === 0) {
    <ClientOnly>
      <EmptyState 
        title="No trips found"
        subtitle="Looks like you havent reserved any trips."
      />
    </ClientOnly>
  }
  return (<ClientOnly>
    <TripClient 
      reservations={reservations}
      currentUser={currentUser}
    />
  </ClientOnly>);
}
 
export default TripsPage;