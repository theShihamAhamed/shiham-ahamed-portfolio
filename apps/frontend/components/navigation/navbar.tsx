import DesktopNavbar from "./desktop-navbar";
import MobileNavbar from "./mobile-navbar";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="flex w-full justify-center px-4 sm:px-0">
        <div className="flex w-full h-14 max-w-7xl items-center sm:h-16">
          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
