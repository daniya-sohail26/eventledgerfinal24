import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import Button from "./Button";

const navItems = ["Features", "About", "Contact"];

const NavBar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navContainerRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const handleStateRepLogin = () => {
    navigate("/login");
  };

  const handleEventHostLogin = () => {
    navigate("/event-host-login");
  };

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          <div className="flex items-center gap-7">
            <img src="/img/logo.png" alt="logo" className="w-20" />
          </div>

          <div className="flex h-full items-center space-x-6">
            <div className="hidden md:block">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="nav-hover-btn"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-3xl text-yellow-400 hover:text-gray-300"
              >
                <FaUserCircle />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-800 rounded-lg shadow-lg">
                  <a
                    href="/buyer-login"
                    className="block px-4 py-2 hover:bg-purple-400"
                  >
                    Login as Buyer
                  </a>
                  <button
                    onClick={handleEventHostLogin}
                    className="block w-full text-left px-4 py-2 hover:bg-purple-400"
                  >
                    Login as Event Host
                  </button>
                  <button
                    onClick={handleStateRepLogin}
                    className="block w-full text-left px-4 py-2 hover:bg-purple-400"
                  >
                    Login as State Representative
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
