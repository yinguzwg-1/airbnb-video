import Image from "next/image";
const Picture = ({ photos }: { photos: { id: number, url: string, title: string }[] }) => {

  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {photos.map((photo) => (
      <div
        key={photo.id}
        className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
      >
        <Image
          src={photo.url}
          alt={photo.title}
          unoptimized={true} 
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {photo.title}
          </p>
        </div>
      </div>
    ))}
  </div>
}
export default Picture;