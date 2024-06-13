import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import notFoundPic from "@/assets/404.jpg";

const Error = () => {
  const location = useLocation();
  console.log("You are at", location.pathname)

  return (
    <div className="m-10 flex flex-col items-center justify-center">
      <div className="w-1/2 m-6">
        <img src={notFoundPic} alt="404" />
      </div>
      <Link to="/">
        <Button>Go back to home</Button>
      </Link>
    </div>
  );
};
export default Error;
