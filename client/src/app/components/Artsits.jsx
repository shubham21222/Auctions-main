import Image from "next/image";
import img1 from "../../../public/1-2.webp" 

const artists = [
  {
    name: "johannes-vermeer",
    image: img1,
  },
  {
    name: "georges-seurat",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/Rectangle-27-1-min.png",
  },
  {
    name: "vincent-van-gogh",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/Rectangle-28-min.png",
  },
  {
    name: "pablo-picasso",
    image: "https://beta.nyelizabeth.com/wp-content/uploads/2024/03/Rectangle-29-min.png",
  },
];

export default function PopularArtists() {
  return (
    <section className="px-4 container mx-auto  py-10">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        Popular Artists
      </h2>
      <div className="w-20 h-1 bg-yellow-500 mt-2 mb-6"></div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl group transition-transform duration-300"
          >
            <Image
              src={artist.image}
              alt={artist.name}
              width={300}
              height={400}
              className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <p className="text-white text-lg font-semibold">{artist.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
