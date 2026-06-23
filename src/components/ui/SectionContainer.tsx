import { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

const SectionContainer = ({ children, className = "" }: SectionContainerProps) => {
  return (
    <section className={`w-full container mx-auto ${className}`}>
      {children}
    </section>
  );
};

export default SectionContainer;
