const MainLayout = ({ children }) => {
  return (
    <main className="mx-auto mt-24 mb-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  );
};

export default MainLayout;
