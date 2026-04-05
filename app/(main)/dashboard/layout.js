import { Suspense } from "react";
import { BarLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-4 md:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="gradient-title text-4xl font-bold md:text-6xl">
          Industry Insights
        </h1>
      </div>

      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
