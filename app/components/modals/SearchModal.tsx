
'use client';
import qs from 'query-string';
import useSearchModal from '@/app/hooks/useSearchModal';
import Modal from './Modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { SEARCH_STEP } from '@/app/common/enum';
import { Range } from 'react-date-range';
import dynamic from 'next/dynamic';
import { CountrySelectValue } from '@/app/common/type';
import { formatISO } from 'date-fns';
import { Calendar, Counter, CountrySelect, Heading } from '..';

const SearchModal = () => {
  const searchModal = useSearchModal();
  const router = useRouter();
  const params = useSearchParams();
  const [location, setLocation] = useState<CountrySelectValue>()
  const [step, setStep] = useState(SEARCH_STEP.LOCATION);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });

  const Map = useMemo(() => 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dynamic(() => import('../Map'), {ssr: false}), [location]);

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);
  const onNext = useCallback(() => {
  setStep((value) => value + 1);
  }, []);
  const onSubmit = useCallback(async () => {
    if (step !== SEARCH_STEP.INFO) {
      return onNext();
    }
    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }
    const updateQuery: any =  {
      ...currentQuery,
      locationValue: location?.value,
      guestCount,
      roomCount,
      bathroomCount
    };
    dateRange.startDate && (updateQuery.startDate = formatISO(dateRange.startDate));
    dateRange.endDate && (updateQuery.endDate = formatISO(dateRange.endDate));
    const url = qs.stringifyUrl({
      url: '/',
      query: updateQuery
    }, { skipNull: true});  
  
    setStep(SEARCH_STEP.LOCATION);
    searchModal.onClose();
    router.push(url);
  }, [bathroomCount, dateRange.endDate, dateRange.startDate, guestCount, location?.value, onNext, params, roomCount, router, searchModal, step])

  const actionLabel = useMemo(() => {
    if (step === SEARCH_STEP.INFO) {
      return 'Search';
    }
    return 'Next';
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === SEARCH_STEP.LOCATION) {
      return undefined;
    }
    return 'Back';
  }, [step]);

  let bodyContent = (<div className=' flex flex-col gap-8'>
    <Heading 
      title='Where do you wanan go?'
      subtitle='Find the perfect location!'
    />
    <CountrySelect 
      value={location}
      onChange={(value) => setLocation(value as CountrySelectValue)}
    />
    <hr />
    <Map center={location?.latlng} />
  </div>)

  if (step === SEARCH_STEP.DATE) {
    bodyContent = (<div className='flex flex-col gap-8'>
      <Heading 
        title='When do you plan to go ?'
        subtitle='Make sure everyone is free!'
      />
      <Calendar 
        value={dateRange}
        onChange={(value) => setDateRange(value.selection)}
      />
    </div>)
  }
  if (step === SEARCH_STEP.INFO) {
    bodyContent = (<div className='flex flex-col gap-8'>
      <Heading 
        title='More information'
        subtitle='Find your perfect palce!'
      />
      <Counter 
        title='Guests'
        subtitle='How many guests are coming?'
        value={guestCount}
        onChange={(value) => setGuestCount(value)}
      />
      <Counter 
        title='Rooms'
        subtitle='How many rooms do you need?'
        value={roomCount}
        onChange={(value) => setRoomCount(value)}
      />
      <Counter 
        title='Bathrooms'
        subtitle='How many bathrooms do you need?'
        value={bathroomCount}
        onChange={(value) => setBathroomCount(value)}
      />
    </div>)
  }
  return (<Modal 
    isOpen={searchModal.isOpen}
    onClose={searchModal.onClose}
    onSubmit={onSubmit}
    title="Filters"
    actionLabel={actionLabel}
    secondaryActionLabel={secondaryActionLabel}
    secondaryAction={step === SEARCH_STEP.LOCATION ? undefined : onBack}
    body={bodyContent}
  />);
}
 
export default SearchModal;