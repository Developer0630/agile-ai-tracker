export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-5 h-5 border-2 border-[#DFE1E6] border-t-[#0052CC] rounded-full animate-spin" />
      <span className="text-xs text-[#626F86]">{message}</span>
    </div>
  );
}
