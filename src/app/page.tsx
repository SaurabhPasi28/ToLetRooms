// app/page.tsx
export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Find Student Housing in India
          </h1>
          {/* <SearchBar /> */}
        </div>
      </div>

      {/* Featured Cities */}
      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-6">Popular Cities</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* {['Kota', 'Delhi', 'Prayagraj'].map(city => (
            <CityCard key={city} name={city} />
          ))} */}
        </div>
      </section>
    </main>
  );
}