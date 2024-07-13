'use client';
import { useEffect } from "react";
import { EmptyState } from "./components";

interface ErrorStateProps {
  error: Error;
}


const ErrorState: React.FC<ErrorStateProps> = ({
  error
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <EmptyState 
    title="Uh oh"
    subtitle="Someting went wrong!"
  />
}
export default ErrorState;