interface SectionProps {
  className?: string;
}

const Section: React.FC<React.PropsWithChildren<SectionProps>> = ({className, children}) => {
  return <section className={className ?? 'px-4'}>{children}</section>;
};

export default Section;
