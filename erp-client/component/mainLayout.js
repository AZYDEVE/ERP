import Sidebar from "./sidebar";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  );
};
export default MainLayout;
