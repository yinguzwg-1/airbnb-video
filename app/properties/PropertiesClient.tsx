'use client';
import { useCallback, useState } from "react";
import { SafeListing, SafeReservation, SafeUser } from "../common/type";
import { Container, Heading, ListingCard } from "../components";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface PropertiesProps {
  currentUser?: SafeUser | null;
  listings: SafeListing[];
}

const Properties: React.FC<PropertiesProps> = ({
  currentUser,
  listings
}) => {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState('');
  const onCancel = useCallback((id: string) => {
    setDeleteId(id);
    axios.delete(`/api/listings/${id}`).then(() => {
      toast.success('Listing delete');
      router.refresh();
    }).catch((error) => {
      toast.error(error?.response?.data.error);
    }).finally(() => {
      setDeleteId('');
    })
  }, [router])
  return (
    <Container>
      <Heading 
        title="Properties"
        subtitle="List of your properties"
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
        {listings.map((listing) => <ListingCard 
          key={listing.id}
          data={listing}
          onAction={onCancel}
          disabled={deleteId === listing.id}
          actionLabel="Delete property"
          currentUser={currentUser}
          actionId={listing.id}
        />)}
      </div>
    </Container>
  );
}
 
export default Properties;