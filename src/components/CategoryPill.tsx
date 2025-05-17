export default function CategoryPill({ icon, label, active }: { icon: string, label: string, active: boolean }) {
    return (
      <button className={`flex flex-col items-center px-4 py-2 rounded-full min-w-fit ${active ? 'border-b-2 border-black' : 'opacity-70'}`}>
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs">{label}</span>
      </button>
    );
  }