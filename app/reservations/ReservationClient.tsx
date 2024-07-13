
'use client';

import { toast } from "react-hot-toast";

import axios from "axios";
import { useRouter } from "next/navigation";
import { Container, Heading, ListingCard } from "../components";
import { SafeReservation, SafeUser } from "../common/type";
import { useCallback, useState } from "react";

interface ReservationClientProps {
  currentUser: SafeUser;
  reservations: SafeReservation[];
}
const ReservationClient: React.FC<ReservationClientProps> = ({
  currentUser,
  reservations
}) => {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState('');
  const onCancel = useCallback((id: string) => {
    setDeleteId(id);
    axios.delete(`/api/reservations/${id}`).then(() => {
      toast.success('Reservation canceled');
      router.refresh();
    }).catch((error) => {
      toast.error(error?.response?.data.error);
    }).finally(() => {
      setDeleteId('');
    })
  }, [router])
  return (<Container>
    <Heading 
      title="Reservations"
      subtitle="Booking on your properties"
    />
    <div
      className="
        mt-10
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
      {reservations.map((reservation) => <ListingCard 
        key={reservation.id}
        data={reservation.listing}
        reservation={reservation}
        actionId={reservation.id}
        onAction={onCancel}
        disabled={deleteId === reservation.id}
        actionLabel="Cancel guest reservation"
        currentUser={currentUser}
      />)}
    </div>
  </Container>);
}
 
export default ReservationClient;