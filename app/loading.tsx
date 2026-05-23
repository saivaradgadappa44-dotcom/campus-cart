export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-t-4 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Loading CampusCart...</p>
    </div>
  )
}
