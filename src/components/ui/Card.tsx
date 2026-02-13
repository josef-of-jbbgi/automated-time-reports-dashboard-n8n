interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}
